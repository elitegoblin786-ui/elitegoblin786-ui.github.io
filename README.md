# TheBrandHouse Website

Static pages plus a lightweight Python backend for the contact form and admin inbox.

## Run locally

1. Open a terminal in this folder.
2. Start the local server:

```bash
python server.py
```

3. Open `http://127.0.0.1:8000`

## Contact form behavior

- Frontend submits to `/api/contact`
- Messages are saved to `storage/contact_messages.jsonl`
- Success popup appears after the backend accepts the submission
- Basic anti-spam protections are enabled:
  - hidden honeypot field
  - minimum form-fill time
  - simple IP-based rate limiting

## Admin inbox

Open:

```bash
http://127.0.0.1:8000/admin
```

Default credentials:

```bash
Username: admin
Password: thebrandhouse123
```

You should change these before real use by setting environment variables:

```bash
ADMIN_USERNAME=Admin1306
ADMIN_PASSWORD=Samsung_1306
```

## Optional email sending

If you want the backend to email `info@thebrandhouse.mu`, set these environment variables before starting the server:

```bash
SMTP_HOST=your.smtp.server
SMTP_PORT=587
SMTP_USER=Nahid1306
SMTP_PASS=Samsung_1306
SMTP_FROM=info@thebrandhouse.mu
```

If SMTP is not configured, submissions are still saved locally.

When SMTP is configured, the backend will:

- send the website inquiry to `info@thebrandhouse.mu`
- send a confirmation email back to the customer
