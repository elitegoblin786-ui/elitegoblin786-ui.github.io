from __future__ import annotations

import base64
import html
import json
import mimetypes
import os
import secrets
import smtplib
import time
from http import cookies
from datetime import datetime, timezone
from email.message import EmailMessage
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse


ROOT = Path(__file__).resolve().parent
STORAGE_DIR = Path(os.getenv("TBH_STORAGE_DIR", str(ROOT / "storage")))
STORAGE_DIR.mkdir(exist_ok=True)
IMAGES_DIR = STORAGE_DIR / "images"
IMAGES_DIR.mkdir(exist_ok=True)
STORAGE_FILE = STORAGE_DIR / "contact_messages.jsonl"
CMS_FILE = STORAGE_DIR / "cms_content.json"
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
RATE_LIMIT_WINDOW_SECONDS = 300
RATE_LIMIT_MAX_REQUESTS = 5
MIN_FORM_FILL_SECONDS = 3
MAX_STORED_SUBMISSIONS = 250
SESSION_COOKIE_NAME = "tbh_backoffice_session"
SESSION_DURATION_SECONDS = 60 * 60 * 8
EDITABLE_EXTENSIONS = {".html", ".css", ".js"}
EDITABLE_EXCLUDED_FILES = {"server.py"}

RATE_LIMIT_STATE: dict[str, list[float]] = {}
SESSION_STATE: dict[str, float] = {}


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


def cms_defaults() -> dict[str, str]:
    return {
        "welcomeImage": "benefit-staff-happiness.jpg",
        "heroPanelImage": "tbh-image-logo.png",
        "timelineBackgroundImage": "timeline-background.jpg",
        "welcomeKicker": "Welcome",
        "welcomeTitle": "Discover TheBrandHouse",
        "welcomeDescription": "Trusted brands, nationwide retail access and dependable service brought together for customers across Mauritius.",
        "welcomePrimaryLabel": "Discover More",
        "welcomePrimaryHref": "about.html",
        "welcomeSecondaryLabel": "View Our Stores",
        "welcomeSecondaryHref": "stores.html",
        "legacyTitle": "Built on more than a century of business heritage",
        "legacyDescription": "TheBrandHouse benefits from long-standing roots in Mauritian business through its shareholder background, combining decades of experience with a modern retail and service outlook.",
        "legacyPrefix": "For over",
        "legacyCount": "100",
        "legacyCountSuffix": "+",
        "legacySuffix": "years of business legacy",
        "heroHeading": "Trusted distribution. Modern retail. Reliable service.",
        "heroDescription": "TheBrandHouse brings together a strong brand portfolio, a wide retail footprint, and dependable after-sales support to serve customers across Mauritius with confidence and consistency.",
        "timelineTitle": "A business story built over time",
        "timelineDescription": "TheBrandHouse stands on decades of experience, retail development and long-term investment in customer service.",
        "timelineOneYear": "1930",
        "timelineOneTitle": "JM Goupille & Co. established",
        "timelineOneDescription": "Historic roots in distribution and brand representation in Mauritius.",
        "timelineTwoYear": "1991",
        "timelineTwoTitle": "Galaxy retail network grows",
        "timelineTwoDescription": "A stronger direct-to-customer presence through a recognised retail chain.",
        "timelineThreeYear": "Today",
        "timelineThreeTitle": "TheBrandHouse platform",
        "timelineThreeDescription": "Distribution, retail and service combined under one unified business identity.",
        "aboutBannerTitle": "Who we are",
        "aboutBannerDescription": "Learn more about TheBrandHouse, its origins, its business activities and the strength behind its portfolio in Mauritius.",
        "aboutOverviewTitle": "Welcome to TheBrandHouse",
        "aboutOverviewDescriptionOne": "TheBrandHouse is the leading distributor and retailer of home appliances and consumer electronics in Mauritius.",
        "aboutOverviewDescriptionTwo": "TheBrandHouse was created from the merger of JM Goupille & Co., founded in 1930 and recognised as one of the reputed importers and distributors in the country, and Waterfalls Marketing, owner of the Galaxy chain of retail stores since 1991.",
        "aboutOverviewDescriptionThree": "Today, TheBrandHouse owns and manages a portfolio of brands and leaders in their respective fields of activity.",
        "aboutPortfolioTitle": "The brands behind TheBrandHouse",
        "aboutPortfolioDescription": "Across retail, online, service, and distribution, TheBrandHouse works with a broad portfolio of recognised consumer brands.",
        "aboutPortfolioImage": "brands-of-tbh.png",
        "aboutActivitiesTitle": "The business at a glance",
        "aboutRetailTitle": "Nationwide customer access",
        "aboutRetailDescription": "Galaxy is a nationwide network of 28 multi-brand retail stores located in both urban and rural areas. Galaxy has also launched its online buying platform to keep up with the evolving retail market.",
        "aboutRetailImage": "retail-photo.avif",
        "aboutOperationsTitle": "Operational strength",
        "aboutOperationsDescriptionOne": "JMG imports, markets and distributes top international brands including Asus, Beko, Black and Decker, Elba, Galanz, JBL, Panasonic, Samsung, Skyworth and Quest.",
        "aboutOperationsDescriptionTwo": "JMG Service Centre is the accredited service centre for JMG and the brands it represents.",
        "aboutOperationsImage": "operations-photo.avif",
        "aboutShareholdingTitle": "Backed by Scott Investments",
        "aboutShareholdingDescriptionOne": "TheBrandHouse's holding company is Scott Investments. Scott Investments is an investment company that has been in business in Mauritius for over 100 years, thereby contributing to the economic and social development of the country.",
        "aboutShareholdingDescriptionTwo": "Scott Investments has interests in various fields of activity which include financial services, distribution and retailing.",
        "aboutCorporateImage": "corporate-photo.jpg",
        "businessesBannerTitle": "Discover our businesses",
        "businessesBannerDescription": "TheBrandHouse operates through a connected platform of distribution, retail presence and accredited after-sales support.",
        "businessesDistributionTitle": "JMG",
        "businessesDistributionDescriptionOne": "JMG is the distribution arm of TheBrandHouse and is one of the most respected organisations in Mauritius in the field of home appliances and consumer electronics.",
        "businessesDistributionDescriptionTwo": "JMG acts as the essential link between brand owners and the market, importing, marketing and distributing a wide range of international brands.",
        "businessesDistributionImage": "business-jmg-transparent.png",
        "businessesRetailTitle": "Galaxy and Samsung Brand Concepts",
        "businessesRetailDescriptionOne": "TheBrandHouse's retail arm trades through its Galaxy stores as well as three Samsung BrandStore locations.",
        "businessesRetailDescriptionTwo": "Located throughout Mauritius, these stores are built to provide customers with high quality products, trusted advice and an excellent customer service experience.",
        "businessesRetailImage": "business-brandconcept-transparent.png",
        "businessesServiceTitle": "JMG Service Centre",
        "businessesServiceDescriptionOne": "The JMG Service Centre provides after-sales service for brands distributed by JMG.",
        "businessesServiceDescriptionTwo": "The team delivers technical training either locally or overseas as provided by principals, and offers both indoor and outdoor repair facilities under and outside warranty.",
        "businessesServiceImage": "business-jmg-replacement.png",
        "careersIntroTitle": "Interested in joining our team?",
        "careersIntroDescriptionOne": "TheBrandHouse is not just any company. It has strong values and aims to be the best in its sector as an employer, supplier and retailer, giving customers the best possible experience.",
        "careersIntroDescriptionTwo": "To achieve this, the company recruits and gives opportunities for staff development and, when a vacancy arises, seeks to recruit the best candidates. Appointments are made on merit.",
        "careersWhyJoinTitle": "Why join TheBrandHouse?",
        "careersWhyJoinDescriptionOne": "The company promotes growth, values commitment, and aims to build a workplace where high standards, strong service and long-term development go together.",
        "careersWhyJoinDescriptionTwo": "Recruitment is based on merit, with opportunities for people who want to contribute, improve and grow within the business.",
        "careersPeopleTitle": "What kind of people do we look for?",
        "careersBenefitsTitle": "Employee benefits",
        "careersBenefitImageOne": "benefit-employee-rewards.png",
        "careersBenefitImageTwo": "benefit-staff-happiness.jpg",
        "careersBenefitImageThree": "benefit-discount-programs.jpg",
        "careersBenefitImageFour": "benefit-aid-employees.jpg",
        "careersBenefitImageFive": "benefit-doctors.jpg",
        "careersJobsTitle": "Open positions",
        "careersJobsDescription": "Current roles highlighted on the existing site",
        "contactTitle": "Contact us",
        "contactOfficeTitle": "Head office",
        "contactLocationTitle": "Find us in Riche Terre",
        "contactLocationDescription": "Tap the location card below to open TheBrandHouse Limited in your device's default maps application.",
        "contactLocationLogo": "thebrandhouse_ltd_logo_transparent.png",
        "newsHeadingTitle": "Highlights, recognition and company updates",
        "newsHeadingDescription": "Follow company milestones, recognitions, launches and important announcements from across TheBrandHouse and its brands.",
        "newsFeaturedTitle": "Recognition that reflects business performance",
        "newsFeaturedDescription": "Featured updates highlight important achievements such as retail awards, new openings and strategic partnership announcements.",
        "newsUpdatesTitle": "Launches, campaigns and milestones",
        "newsUpdatesDescription": "Regular company news keeps customers, partners and stakeholders informed about the latest activity across the business.",
        "newsArticleTitle": "Samsung Number 1 Retail Partner by Samsung Africa",
        "newsArticleMeta": "Company recognition and partnership highlight",
        "newsArticleIntro": "Recognized as Samsung Number 1 Retail Partner by Samsung Africa.",
        "newsArticleDescriptionOne": "TheBrandHouse, operator of Galaxy and Samsung Brandstore Tribeca Mall, Bagatelle Mall and Riche Terre Mall, was recognised for this achievement by Samsung Africa. The recognition reflects the team's dedication, hard work and collaborative efforts with partners and associates.",
        "newsArticleDescriptionTwo": "This recognition reflects the strength of the retail partnership, the commitment of the teams involved and the continued performance of TheBrandHouse in the Mauritian market.",
        "storesHeadingTitle": "Retail presence across Mauritius",
        "storesHeadingDescription": "Browse TheBrandHouse retail locations across Mauritius through a structured store directory with direct access to each location in Google Maps.",
        "storesHeroTitle": "Accessible retail locations across the island",
        "storesHeroDescription": "TheBrandHouse retail network is one of the strongest customer-facing parts of the business, combining broad accessibility with recognised shopping concepts.",
    }


def read_cms_content() -> dict[str, str]:
    defaults = cms_defaults()
    if not CMS_FILE.exists():
        return defaults

    try:
        parsed = json.loads(CMS_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return defaults

    if not isinstance(parsed, dict):
        return defaults

    clean_values = {key: sanitize_text(value) for key, value in parsed.items()}
    return {**defaults, **clean_values}


def write_cms_content(content: dict[str, object]) -> dict[str, str]:
    defaults = cms_defaults()
    merged = {**defaults, **{key: sanitize_text(value) for key, value in content.items()}}
    CMS_FILE.write_text(json.dumps(merged, ensure_ascii=False, indent=2), encoding="utf-8")
    return merged


def parse_multipart_upload(headers, body: bytes) -> tuple[str | None, bytes | None]:
    content_type = headers.get("content-type", "")
    if "multipart/form-data" not in content_type:
        return None, None

    boundary_token = None
    for part in content_type.split(";"):
        part = part.strip()
        if part.startswith("boundary="):
            boundary_token = part.split("=", 1)[1].strip('"')
            break

    if not boundary_token:
        return None, None

    boundary = ("--" + boundary_token).encode("utf-8")
    for section in body.split(boundary):
        section = section.strip()
        if not section or section == b"--":
            continue
        if section.endswith(b"--"):
            section = section[:-2].rstrip()

        header_block, separator, file_block = section.partition(b"\r\n\r\n")
        if not separator:
            continue

        header_text = header_block.decode("utf-8", errors="ignore")
        if 'name="file"' not in header_text or "filename=" not in header_text:
            continue

        filename = None
        for line in header_text.split("\r\n"):
            if "filename=" not in line:
                continue
            filename_part = line.split("filename=", 1)[1].strip()
            filename = filename_part.strip('"')
            break

        if not filename:
            continue

        return filename, file_block.rstrip(b"\r\n")

    return None, None


def save_uploaded_image(filename: str, file_bytes: bytes) -> str | None:
    filename = Path(filename).name
    if not filename:
        return None
    safe_filename = "".join(c for c in filename if c.isalnum() or c in "._-").strip()
    if not safe_filename:
        return None
    safe_filename = f"{int(time.time())}-{safe_filename}"
    target_path = IMAGES_DIR / safe_filename
    with open(target_path, 'wb') as f:
        f.write(file_bytes)
    return safe_filename


def list_editable_site_files() -> list[dict[str, object]]:
    files: list[dict[str, object]] = []
    for path in sorted(ROOT.iterdir(), key=lambda item: item.name.lower()):
        if not path.is_file():
            continue
        if path.name in EDITABLE_EXCLUDED_FILES or path.suffix.lower() not in EDITABLE_EXTENSIONS:
            continue
        files.append(
            {
                "path": path.name,
                "size": path.stat().st_size,
                "type": path.suffix.lower().lstrip("."),
            }
        )
    return files


def resolve_editable_site_file(requested_path: str) -> Path | None:
    cleaned = sanitize_text(requested_path).replace("\\", "/").lstrip("/")
    if not cleaned:
        return None

    target = (ROOT / cleaned).resolve()
    if ROOT not in target.parents and target != ROOT:
        return None
    if target.name in EDITABLE_EXCLUDED_FILES:
        return None
    if target.suffix.lower() not in EDITABLE_EXTENSIONS:
        return None
    return target


def build_new_page_template(filename: str, page_title: str, banner_title: str, banner_description: str) -> str:
    label = banner_title or page_title or Path(filename).stem.replace("-", " ").title()
    description = banner_description or f"Learn more about {label} at TheBrandHouse."
    title_value = page_title or f"TheBrandHouse | {label}"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{html.escape(title_value)}</title>
  <meta name="description" content="{html.escape(description)}">
  <link rel="icon" type="image/png" href="thebrandhouse_ltd_logo_transparent.png">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="site-header">
    <div class="container nav-wrap">
      <a class="brand" href="index.html">
        <img class="brand-logo" src="thebrandhouse_ltd_logo.jpg" alt="TheBrandHouse logo">
        <div class="brand-text">
          <h1>TheBrandHouse</h1>
          <p>{html.escape(label)}</p>
        </div>
      </a>
      <button class="mobile-nav-toggle" type="button" aria-expanded="false" aria-controls="siteMenu" aria-label="Open navigation">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav class="site-nav" id="siteMenu" aria-label="Primary">
        <a href="about.html">About Us</a>
        <a href="businesses.html">Our Businesses</a>
        <a href="news.html">News</a>
        <a href="careers.html">Careers</a>
        <a href="contact.html">Contact</a>
        <a href="stores.html">Our Stores</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="page-banner">
      <div class="container">
        <div class="banner-card reveal">
          <span class="eyebrow">New Page</span>
          <h2>{html.escape(label)}</h2>
          <p>{html.escape(description)}</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="placeholder-page reveal">
          <h3>Page content area</h3>
          <p>Use the Back Office page manager to continue building this page.</p>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container footer-wrap">
      <div class="footer-card">
        <div class="footer-block">
          <h3 class="footer-title">TheBrandHouse</h3>
          <p class="footer-copy">
            Trusted distribution, modern retail and reliable service across Mauritius.
          </p>
        </div>
        <div class="footer-block">
          <h4>Quick Links</h4>
          <ul class="footer-links">
            <li><a href="about.html">About Us</a></li>
            <li><a href="businesses.html">Our Businesses</a></li>
            <li><a href="careers.html">Careers</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
        <div class="footer-block">
          <h4>Contact</h4>
          <ul class="footer-contact-list">
            <li>Industrial Park 1, Riche Terre, Mauritius</li>
            <li><a href="mailto:info@thebrandhouse.mu">info@thebrandhouse.mu</a></li>
            <li><a href="tel:+2302071700">(+230) 207 1700</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; 2026 TheBrandHouse. All rights reserved.</span>
        <div class="footer-bottom-links">
          <a href="privacy.html">Privacy Policy</a>
          <a href="terms.html">Terms</a>
          <a href="contact.html">Contact</a>
          <a href="backoffice.html">Back Office</a>
        </div>
      </div>
    </div>
  </footer>
  <script src="site.js"></script>
</body>
</html>
"""


def get_backoffice_credentials() -> tuple[str, str]:
    return (
        os.getenv("BACKOFFICE_USERNAME", "AdminTBH_404"),
        os.getenv("BACKOFFICE_PASSWORD", "BOsyst_404"),
    )


def credentials_are_valid(username: str, password: str) -> bool:
    expected_username, expected_password = get_backoffice_credentials()
    return secrets.compare_digest(username, expected_username) and secrets.compare_digest(
        password, expected_password
    )


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
    def _send_json(
        self, status: int, payload: dict[str, object], extra_headers: list[tuple[str, str]] | None = None
    ) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        if extra_headers:
            for header_name, header_value in extra_headers:
                self.send_header(header_name, header_value)
        self.end_headers()
        self.wfile.write(body)

    def _parse_json_body(self) -> dict[str, object] | None:
        content_length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(content_length)
        try:
            parsed = json.loads(raw_body.decode("utf-8"))
        except json.JSONDecodeError:
            return None
        return parsed if isinstance(parsed, dict) else None

    def _parse_cookie_value(self, cookie_name: str) -> str | None:
        raw_cookie = self.headers.get("Cookie")
        if not raw_cookie:
            return None
        parsed_cookie = cookies.SimpleCookie()
        parsed_cookie.load(raw_cookie)
        morsel = parsed_cookie.get(cookie_name)
        return morsel.value if morsel else None

    def _purge_expired_sessions(self) -> None:
        now = time.time()
        expired_tokens = [
            token for token, expires_at in SESSION_STATE.items() if expires_at <= now
        ]
        for token in expired_tokens:
            SESSION_STATE.pop(token, None)

    def _current_session_token(self) -> str | None:
        self._purge_expired_sessions()
        token = self._parse_cookie_value(SESSION_COOKIE_NAME)
        if not token:
            return None
        expires_at = SESSION_STATE.get(token)
        if not expires_at or expires_at <= time.time():
            SESSION_STATE.pop(token, None)
            return None
        return token

    def _is_backoffice_authenticated(self) -> bool:
        return self._current_session_token() is not None

    def _create_session(self) -> str:
        token = secrets.token_urlsafe(32)
        SESSION_STATE[token] = time.time() + SESSION_DURATION_SECONDS
        return token

    def _session_cookie_header(self, token: str, *, expired: bool = False) -> tuple[str, str]:
        cookie = cookies.SimpleCookie()
        cookie[SESSION_COOKIE_NAME] = token if not expired else ""
        cookie[SESSION_COOKIE_NAME]["path"] = "/"
        cookie[SESSION_COOKIE_NAME]["httponly"] = True
        cookie[SESSION_COOKIE_NAME]["samesite"] = "Lax"
        if expired:
            cookie[SESSION_COOKIE_NAME]["max-age"] = 0
        else:
            cookie[SESSION_COOKIE_NAME]["max-age"] = str(SESSION_DURATION_SECONDS)
        if self.headers.get("X-Forwarded-Proto", "").lower() == "https":
            cookie[SESSION_COOKIE_NAME]["secure"] = True
        return ("Set-Cookie", cookie.output(header="").strip())

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

    def _require_backoffice_session(self) -> bool:
        if self._is_backoffice_authenticated():
            return True
        self._send_json(401, {"success": False, "message": "Authentication required."})
        return False

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
        query = parse_qs(parsed.query)

        if request_path == "/api/cms-content":
            self._send_json(200, {"success": True, "content": read_cms_content()})
            return

        if request_path.startswith("/images/"):
            image_name = request_path[len("/images/"):]
            image_path = IMAGES_DIR / image_name
            if image_path.exists() and image_path.is_file():
                self._serve_file(image_path)
            else:
                self.send_error(404, "Image not found")
            return

        if request_path == "/api/backoffice/session":
            if not self._is_backoffice_authenticated():
                self._send_json(401, {"success": False, "authenticated": False})
                return
            self._send_json(200, {"success": True, "authenticated": True})
            return

        if request_path == "/api/backoffice/files":
            if not self._require_backoffice_session():
                return
            self._send_json(200, {"success": True, "files": list_editable_site_files()})
            return

        if request_path == "/api/backoffice/file":
            if not self._require_backoffice_session():
                return
            requested_path = sanitize_text((query.get("path") or [""])[0])
            target = resolve_editable_site_file(requested_path)
            if not target or not target.exists() or not target.is_file():
                self._send_json(404, {"success": False, "message": "Editable file not found."})
                return
            try:
                content = target.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                self._send_json(400, {"success": False, "message": "This file cannot be opened in the page manager."})
                return
            self._send_json(200, {"success": True, "path": target.name, "content": content})
            return

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

        if request_path in {"/backoffice", "/backoffice/"}:
            self._serve_file(ROOT / "backoffice.html")
            return

        if request_path in {"/backoffice/dashboard", "/backoffice/dashboard/"}:
            if not self._is_backoffice_authenticated():
                self.send_response(302)
                self.send_header("Location", "/backoffice.html")
                self.end_headers()
                return
            self._serve_file(ROOT / "backoffice-dashboard.html")
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

        if parsed.path == "/api/backoffice/login":
            payload = self._parse_json_body()
            if payload is None:
                self._send_json(400, {"success": False, "message": "Invalid request payload."})
                return

            username = sanitize_text(payload.get("username"))
            password = sanitize_text(payload.get("password"))
            if not credentials_are_valid(username, password):
                self._send_json(401, {"success": False, "message": "Incorrect username or password."})
                return

            token = self._create_session()
            self._send_json(
                200,
                {"success": True, "message": "Authentication successful."},
                extra_headers=[self._session_cookie_header(token)],
            )
            return

        if parsed.path == "/api/backoffice/logout":
            token = self._current_session_token()
            if token:
                SESSION_STATE.pop(token, None)
            self._send_json(
                200,
                {"success": True, "message": "Logged out successfully."},
                extra_headers=[self._session_cookie_header("", expired=True)],
            )
            return

        if parsed.path == "/api/cms-content":
            if not self._require_backoffice_session():
                return
            payload = self._parse_json_body()
            if payload is None:
                self._send_json(400, {"success": False, "message": "Invalid request payload."})
                return
            saved_content = write_cms_content(payload)
            self._send_json(200, {"success": True, "content": saved_content})
            return

        if parsed.path == "/api/upload-image":
            if not self._require_backoffice_session():
                return
            content_length = int(self.headers.get("content-length", "0"))
            if content_length <= 0:
                self._send_json(400, {"success": False, "message": "Expected multipart/form-data."})
                return
            raw_body = self.rfile.read(content_length)
            original_filename, file_bytes = parse_multipart_upload(self.headers, raw_body)
            if not original_filename or file_bytes is None:
                self._send_json(400, {"success": False, "message": "No valid file uploaded."})
                return
            filename = save_uploaded_image(original_filename, file_bytes)
            if not filename:
                self._send_json(400, {"success": False, "message": "No valid file uploaded."})
                return
            self._send_json(200, {"success": True, "filename": filename})
            return

        if parsed.path == "/api/backoffice/file":
            if not self._require_backoffice_session():
                return
            payload = self._parse_json_body()
            if payload is None:
                self._send_json(400, {"success": False, "message": "Invalid request payload."})
                return
            target = resolve_editable_site_file(sanitize_text(payload.get("path")))
            if not target or not target.exists() or not target.is_file():
                self._send_json(404, {"success": False, "message": "Editable file not found."})
                return
            content = str(payload.get("content", ""))
            target.write_text(content, encoding="utf-8")
            self._send_json(200, {"success": True, "message": "File saved successfully."})
            return

        if parsed.path == "/api/backoffice/create-page":
            if not self._require_backoffice_session():
                return
            payload = self._parse_json_body()
            if payload is None:
                self._send_json(400, {"success": False, "message": "Invalid request payload."})
                return

            raw_filename = sanitize_text(payload.get("filename")).lower()
            if not raw_filename.endswith(".html"):
                raw_filename += ".html"
            safe_filename = "".join(char for char in raw_filename if char.isalnum() or char in "._-")
            if not safe_filename or safe_filename in EDITABLE_EXCLUDED_FILES or not safe_filename.endswith(".html"):
                self._send_json(400, {"success": False, "message": "Please enter a valid page filename ending in .html."})
                return

            target = resolve_editable_site_file(safe_filename)
            if not target:
                self._send_json(400, {"success": False, "message": "That filename cannot be created."})
                return
            if target.exists():
                self._send_json(409, {"success": False, "message": "A file with that name already exists."})
                return

            page_title = sanitize_text(payload.get("pageTitle")) or f"TheBrandHouse | {Path(safe_filename).stem.replace('-', ' ').title()}"
            banner_title = sanitize_text(payload.get("bannerTitle")) or Path(safe_filename).stem.replace("-", " ").title()
            banner_description = sanitize_text(payload.get("bannerDescription"))
            target.write_text(
                build_new_page_template(safe_filename, page_title, banner_title, banner_description),
                encoding="utf-8",
            )
            self._send_json(
                200,
                {"success": True, "message": "Page created successfully.", "path": target.name},
            )
            return

        if parsed.path != "/api/contact":
            self._send_json(404, {"success": False, "message": "Route not found."})
            return

        ip_address = self.client_address[0]
        within_limit, rate_limit_message = check_rate_limit(ip_address)
        if not within_limit:
            self._send_json(429, {"success": False, "message": rate_limit_message})
            return

        payload = self._parse_json_body()
        if payload is None:
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
    server.serve_forever()


if __name__ == "__main__":
    run()
