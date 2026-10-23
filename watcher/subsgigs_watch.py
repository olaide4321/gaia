"""Watch the SubsGigs campaigns page and alert on new or changed campaigns.

Renders the page in headless Chromium (the site is a JS app), collects every
campaign link plus the visible text, compares against the last saved state and
sends Telegram and/or email alerts when something new appears.

Configuration (environment variables):
  WATCH_URL            page to watch (default: the SubsGigs campaigns page)
  STATE_FILE           where the last-seen snapshot is stored
  TELEGRAM_BOT_TOKEN   bot token from @BotFather            (optional)
  TELEGRAM_CHAT_ID     your chat id with that bot           (optional)
  SMTP_USER            Gmail address used to send           (optional)
  SMTP_PASSWORD        Gmail app password                   (optional)
  ALERT_EMAIL_TO       recipient (defaults to SMTP_USER)
  SEND_TEST_ALERT      "true" to send a test alert and exit
"""

import json
import os
import re
import smtplib
import sys
from email.message import EmailMessage
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from playwright.sync_api import sync_playwright

WATCH_URL = os.environ.get("WATCH_URL") or "https://subsgigs-alpha.vercel.app/campaigns"
STATE_FILE = Path(os.environ.get("STATE_FILE") or Path(__file__).with_name("state.json"))

# Words that suggest a campaign is accepting work.
OPEN_WORDS = re.compile(r"\b(open|live|active|join|apply|available|slots? left|start task)\b", re.I)
# Lines that are just UI noise and should not trigger alerts on their own.
NOISE = re.compile(r"^(\d+[smhd] ago|\d{1,2}:\d{2}(:\d{2})?|loading\.*)$", re.I)


def fetch_snapshot(url):
    """Return {"campaigns": {href: text}, "lines": [visible text lines]}, or None if blocked."""
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(url, wait_until="networkidle", timeout=60_000)
        page.wait_for_timeout(3_000)  # let client-side lists finish rendering
        if page.title() == "Vercel Security Checkpoint":
            browser.close()
            return None
        links = page.eval_on_selector_all(
            "a[href]",
            "els => els.map(e => [e.getAttribute('href'), e.innerText.trim()])",
        )
        body_text = page.inner_text("body")
        browser.close()

    base_path = urlparse(url).path.rstrip("/")
    campaigns = {}
    for href, text in links:
        full = urljoin(url, href)
        path = urlparse(full).path.rstrip("/")
        # A campaign detail link looks like /campaigns/<something>.
        if path.startswith(base_path + "/") and path != base_path:
            campaigns[full] = " ".join(text.split())[:300]

    lines = []
    for line in body_text.splitlines():
        line = " ".join(line.split())
        if line and not NOISE.match(line) and line not in lines:
            lines.append(line)
    return {"campaigns": campaigns, "lines": lines}


def load_state():
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return None


def save_state(snapshot):
    STATE_FILE.write_text(json.dumps(snapshot, indent=2, sort_keys=True) + "\n")


def diff(old, new):
    """Return a list of human-readable changes worth alerting on."""
    changes = []
    for href, text in new["campaigns"].items():
        if href not in old["campaigns"]:
            changes.append(f"NEW campaign: {text or '(no title)'}\n{href}")
        elif text != old["campaigns"][href] and OPEN_WORDS.search(text):
            changes.append(f"Campaign updated: {text}\n{href}")

    # Fall back to page text when campaigns are not separate links.
    if not new["campaigns"] or not changes:
        old_lines = set(old["lines"])
        added = [l for l in new["lines"] if l not in old_lines]
        if added:
            preview = "\n".join(f"+ {l}" for l in added[:15])
            more = f"\n(+{len(added) - 15} more lines)" if len(added) > 15 else ""
            changes.append(f"Page content changed:\n{preview}{more}")
    return changes


def send_telegram(text):
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")
    if not (token and chat_id):
        return False
    resp = requests.post(
        f"https://api.telegram.org/bot{token}/sendMessage",
        json={"chat_id": chat_id, "text": text[:4000], "disable_web_page_preview": True},
        timeout=30,
    )
    resp.raise_for_status()
    return True


def send_email(subject, text):
    user = os.environ.get("SMTP_USER")
    password = os.environ.get("SMTP_PASSWORD")
    if not (user and password):
        return False
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = user
    msg["To"] = os.environ.get("ALERT_EMAIL_TO") or user
    msg.set_content(text)
    with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=30) as smtp:
        smtp.login(user, password)
        smtp.send_message(msg)
    return True


def alert(subject, body):
    text = f"{subject}\n\n{body}\n\n{WATCH_URL}"
    sent = []
    for name, send in (("telegram", lambda: send_telegram(text)),
                       ("email", lambda: send_email(subject, text))):
        try:
            if send():
                sent.append(name)
        except Exception as exc:  # one channel failing must not block the other
            print(f"{name} alert failed: {exc}", file=sys.stderr)
    print(f"Alert sent via: {', '.join(sent) or 'nothing (no channel configured or all failed)'}")
    return bool(sent)


def main():
    if os.environ.get("SEND_TEST_ALERT", "").lower() == "true":
        ok = alert("SubsGigs watcher: test alert", "If you can read this, alerts are working.")
        sys.exit(0 if ok else 1)

    snapshot = fetch_snapshot(WATCH_URL)
    if snapshot is None:
        print("Blocked by Vercel Security Checkpoint; the site refuses this runner. Nothing saved.")
        return
    print(f"Found {len(snapshot['campaigns'])} campaign links, {len(snapshot['lines'])} text lines")
    if not snapshot["lines"]:
        print("Page rendered empty; skipping so a blank load is not treated as a change.")
        return

    old = load_state()
    if old is None:
        save_state(snapshot)
        names = "\n".join(f"- {t or h}" for h, t in snapshot["campaigns"].items()) or "(none listed as links)"
        alert("SubsGigs watcher is running",
              f"Baseline saved. Currently visible campaigns:\n{names}")
        return

    changes = diff(old, snapshot)
    if snapshot != old:
        save_state(snapshot)
    if changes:
        alert("SubsGigs: new work may be open!", "\n\n".join(changes))
    else:
        print("No new campaigns.")


if __name__ == "__main__":
    main()
