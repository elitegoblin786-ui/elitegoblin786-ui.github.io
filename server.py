from __future__ import annotations

import base64
import html
import json
import mimetypes
import os
import smtplib
import time
from datetime import datetime, timezone
from email.message import EmailMessage
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parent
STORAGE_DIR = ROOT / "storage"
STORAGE_DIR.mkdir(exist_ok=True)
STORAGE_FILE = STORAGE_DIR / "contact_messages.jsonl"
HOST = "127.0.0.1"
PORT = 8000
RATE_LIMIT_WINDOW_SECONDS = 300
RATE_LIMIT_MAX_REQUESTS = 5
MIN_FORM_FILL_SECONDS = 3
MAX_STORED_SUBMISSIONS = 250

RATE_LIMIT_STATE: dict[str, list[float]] = {}


def guess_content_type(path: Path) -> str:
    content_type, _ = mimetypes.guess_type(str(path))
    return content_type or "application/octet-stream"


def sanitize_text(value: object) -> str:
    return str(value or "").strip()


def now_utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def is_valid_email(email: str) -> bool:
    if "@" not in email:
        return False
    local_part, _, domain = email.partition("@")
    return bool(local_part and "." in domain and " " not in email)


def check_rate_limit(ip_address: str) -> tuple[bool, str]:
    current_time = time.time()
    request_times = RATE_LIMIT_STATE.get(ip_address, [])
    fresh_times = [
        timestamp
        for timestamp in request_times
        if current_time - timestamp < RATE_LIMIT_WINDOW_SECONDS
    ]

    if len(fresh_times) >= RATE_LIMIT_MAX_REQUESTS:
        return False, "Too many submissions. Please wait a few minutes and try again."

    fresh_times.append(current_time)
    RATE_LIMIT_STATE[ip_address] = fresh_times
    return True, ""


def validate_payload(payload: dict[str, object]) -> tuple[bool, str]:
    required_fields = [
        "name",
        "surname",
        "phone",
        "email",
        "subject",
        "message",
        "form_started_at",
    ]
    missing = [field for field in required_fields if not sanitize_text(payload.get(field))]
    if missing:
        return False, "All fields are required."

    email = sanitize_text(payload.get("email"))
    if not is_valid_email(email):
        return False, "Please enter a valid email address."

    honeypot = sanitize_text(payload.get("company_website"))
    if honeypot:
        return False, "Spam protection triggered."

    try:
        form_started_at = float(sanitize_text(payload.get("form_started_at")))
    except ValueError:
        return False, "Invalid form timing."

    if time.time() - form_started_at < MIN_FORM_FILL_SECONDS:
        return False, "Please take a moment to complete the form before submitting."

    return True, ""


def send_email_if_configured(payload: dict[str, str]) -> bool:
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASS")
    smtp_from = os.getenv("SMTP_FROM", "info@thebrandhouse.mu")
    recipient = "info@thebrandhouse.mu"

    if not smtp_host:
        return False

    owner_message = EmailMessage()
    owner_message["Subject"] = f"Website contact: {payload['subject']}"
    owner_message["From"] = smtp_from
    owner_message["To"] = recipient
    owner_message["Reply-To"] = payload["email"]
    owner_message.set_content(
        "\n".join(
            [
                "A new website contact form submission has been received.",
                "",
                f"Name: {payload['name']} {payload['surname']}",
                f"Phone number: {payload['phone']}",
                f"Email: {payload['email']}",
                "",
                "Message:",
                payload["message"],
            ]
        )
    )

    customer_message = EmailMessage()
    customer_message["Subject"] = "We have received your message"
    customer_message["From"] = smtp_from
    customer_message["To"] = payload["email"]
    customer_message.set_content(
        "\n".join(
            [
                f"Hello {payload['name']},",
                "",
                "Thank you for contacting TheBrandHouse.",
                "Your message has been received successfully and our team will contact you back shortly.",
                "",
                "Subject:",
                payload["subject"],
                "",
                "Kind regards,",
                "TheBrandHouse",
            ]
        )
    )

    with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as smtp:
        smtp.starttls()
        if smtp_user and smtp_password:
            smtp.login(smtp_user, smtp_password)
        smtp.send_message(owner_message)
        smtp.send_message(customer_message)
    return True


def append_submission(record: dict[str, object]) -> None:
    with STORAGE_FILE.open("a", encoding="utf-8") as file_handle:
        file_handle.write(json.dumps(record, ensure_ascii=False) + "\n")


def read_submissions() -> list[dict[str, object]]:
    if not STORAGE_FILE.exists():
        return []

    records: list[dict[str, object]] = []
    with STORAGE_FILE.open("r", encoding="utf-8") as file_handle:
        for line in file_handle:
            line = line.strip()
            if not line:
                continue
            try:
                data = json.loads(line)
            except json.JSONDecodeError:
                continue
            if isinstance(data, dict):
                records.append(data)
    return records[-MAX_STORED_SUBMISSIONS:][::-1]


def basic_auth_is_valid(header_value: str | None) -> bool:
    admin_user = os.getenv("ADMIN_USERNAME", "admin")
    admin_password = os.getenv("ADMIN_PASSWORD", "thebrandhouse123")

    if not header_value or not header_value.startswith("Basic "):
        return False

    encoded_credentials = header_value.split(" ", 1)[1]
    try:
        decoded = base64.b64decode(encoded_credentials).decode("utf-8")
    except Exception:
        return False

    username, _, password = decoded.partition(":")
    return username == admin_user and password == admin_password


def render_admin_page(records: list[dict[str, object]]) -> str:
    rows = []
    for record in records:
        rows.append(
            f"""
            <article class="submission-card">
              <div class="submission-top">
                <h2>{html.escape(str(record.get("subject", "No subject")))}</h2>
                <span>{html.escape(str(record.get("submitted_at", "")))}</span>
              </div>
              <p><strong>Name:</strong> {html.escape(str(record.get("name", "")))} {html.escape(str(record.get("surname", "")))}</p>
              <p><strong>Email:</strong> {html.escape(str(record.get("email", "")))}</p>
              <p><strong>Phone:</strong> {html.escape(str(record.get("phone", "")))}</p>
              <p><strong>IP:</strong> {html.escape(str(record.get("ip", "")))}</p>
              <div class="submission-message">{html.escape(str(record.get("message", ""))).replace(chr(10), "<br>")}</div>
            </article>
            """
        )

    if not rows:
        rows.append('<p class="empty-state">No submissions received yet.</p>')

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TheBrandHouse | Admin Inbox</title>
  <style>
    body {{
      margin: 0;
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(180deg, #f7f9fc 0%, #eef3f9 100%);
      color: #162033;
    }}
    .wrap {{
      width: min(calc(100% - 32px), 1100px);
      margin: 0 auto;
      padding: 40px 0 60px;
    }}
    .hero {{
      background: linear-gradient(135deg, #121926, #1d3f97);
      color: white;
      border-radius: 28px;
      padding: 32px;
      box-shadow: 0 20px 60px rgba(18, 25, 38, 0.18);
      margin-bottom: 28px;
    }}
    .hero h1 {{
      margin: 0 0 10px;
      font-size: 2.4rem;
    }}
    .hero p {{
      margin: 0;
      color: rgba(255,255,255,0.82);
    }}
    .submission-grid {{
      display: grid;
      gap: 18px;
    }}
    .submission-card {{
      background: white;
      border-radius: 24px;
      padding: 24px;
      box-shadow: 0 14px 36px rgba(18, 25, 38, 0.08);
      border: 1px solid rgba(22, 32, 51, 0.08);
    }}
    .submission-top {{
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: start;
      margin-bottom: 12px;
    }}
    .submission-top h2 {{
      margin: 0;
      font-size: 1.35rem;
    }}
    .submission-top span, p {{
      color: #5f6b7c;
      line-height: 1.7;
    }}
    .submission-message {{
      margin-top: 16px;
      padding: 18px;
      border-radius: 18px;
      background: #f4f7fb;
      color: #162033;
      line-height: 1.7;
    }}
    .empty-state {{
      background: white;
      border-radius: 24px;
      padding: 24px;
      box-shadow: 0 14px 36px rgba(18, 25, 38, 0.08);
    }}
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <h1>TheBrandHouse Admin Inbox</h1>
      <p>Recent contact form submissions stored by the local Python backend.</p>
    </section>
    <section class="submission-grid">
      {''.join(rows)}
    </section>
  </div>
</body>
</html>"""


class SiteHandler(BaseHTTPRequestHandler):
    def _send_json(self, status: int, payload: dict[str, object]) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _serve_file(self, path: Path) -> None:
        if path.is_dir():
            path = path / "index.html"

        resolved_path = path.resolve()
        if not path.exists() or (ROOT not in resolved_path.parents and resolved_path != ROOT):
            self.send_error(404, "File not found")
            return

        data = path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", guess_content_type(path))
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _require_admin_auth(self) -> bool:
        auth_header = self.headers.get("Authorization")
        if basic_auth_is_valid(auth_header):
            return True

        self.send_response(401)
        self.send_header("WWW-Authenticate", 'Basic realm="TheBrandHouse Admin"')
        self.end_headers()
        return False

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        request_path = unquote(parsed.path)

        if request_path == "/admin":
            if not self._require_admin_auth():
                return
            page = render_admin_page(read_submissions()).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(page)))
            self.end_headers()
            self.wfile.write(page)
            return

        if request_path == "/api/submissions":
            if not self._require_admin_auth():
                return
            self._send_json(200, {"success": True, "records": read_submissions()})
            return

        if request_path in {"", "/"}:
            self._serve_file(ROOT / "index.html")
            return

        normalized = request_path.lstrip("/")
        target = (ROOT / normalized).resolve()
        if ROOT not in target.parents and target != ROOT:
            self.send_error(403, "Forbidden")
            return
        self._serve_file(target)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path != "/api/contact":
            self._send_json(404, {"success": False, "message": "Route not found."})
            return

        ip_address = self.client_address[0]
        within_limit, rate_limit_message = check_rate_limit(ip_address)
        if not within_limit:
            self._send_json(429, {"success": False, "message": rate_limit_message})
            return

        content_length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(content_length)

        try:
            payload = json.loads(raw_body.decode("utf-8"))
        except json.JSONDecodeError:
            self._send_json(400, {"success": False, "message": "Invalid request payload."})
            return

        is_valid, validation_message = validate_payload(payload)
        if not is_valid:
            if validation_message == "Spam protection triggered.":
                self._send_json(200, {"success": True, "message": "Message received successfully."})
                return
            self._send_json(422, {"success": False, "message": validation_message})
            return

        clean_payload = {
            "name": sanitize_text(payload.get("name")),
            "surname": sanitize_text(payload.get("surname")),
            "phone": sanitize_text(payload.get("phone")),
            "email": sanitize_text(payload.get("email")),
            "subject": sanitize_text(payload.get("subject")),
            "message": sanitize_text(payload.get("message")),
            "form_started_at": sanitize_text(payload.get("form_started_at")),
        }

        record = {
            **clean_payload,
            "submitted_at": now_utc_iso(),
            "ip": ip_address,
        }
        append_submission(record)

        email_sent = False
        email_error = None
        try:
            email_sent = send_email_if_configured(clean_payload)
        except Exception as exc:  # pragma: no cover
            email_error = str(exc)

        response_message = "Message received successfully."
        if email_sent:
            response_message = "Message received and email sent successfully."
        elif email_error:
            response_message = "Message received successfully. Email delivery is not configured yet."

        self._send_json(200, {"success": True, "message": response_message})


def run() -> None:
    server = ThreadingHTTPServer((HOST, PORT), SiteHandler)
    print(f"Serving TheBrandHouse site on http://{HOST}:{PORT}")
    print("Admin inbox available at http://127.0.0.1:8000/admin")
    server.serve_forever()


if __name__ == "__main__":
    run()
