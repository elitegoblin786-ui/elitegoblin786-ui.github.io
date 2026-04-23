# TheBrandHouse Website

Static pages plus a lightweight Python backend for the contact form and admin inbox.

## Run locally

1. Open a terminal in this folder.
2. Start the local server:

```bash
python server.py
```

3. Open `http://127.0.0.1:8080`

Or on Windows, double-click:

```bash
start-backoffice.bat
```

This starts the local server in a new terminal window and opens the backoffice automatically.

## VS Code auto-start

When this folder is opened in VS Code, the workspace now auto-runs a startup task that makes sure the local server is available at:

```bash
http://localhost:8080
```

Backoffice stays at:

```bash
http://localhost:8080/backoffice
```

If you use the built-in launch config, it now starts the same server automatically before opening Chrome.

## Contact form behavior

- Frontend submits to `/api/contact`
- Messages are saved to `storage/contact_messages.jsonl`
- Success popup appears after the backend accepts the submission
- Basic anti-spam protections are enabled:
  - hidden honeypot field
  - minimum form-fill time
  - simple IP-based rate limiting

## Admin inbox

The admin inbox no longer uses the browser's basic-auth popup.

1. Sign in through:

```bash
http://127.0.0.1:8080/backoffice
```

2. Then open:

```bash
http://127.0.0.1:8080/admin
```

It now uses the same backoffice session after login.

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
