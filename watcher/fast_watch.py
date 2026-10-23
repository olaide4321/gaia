"""Fast SubsGigs watcher: polls the site's data endpoint every few seconds.

Unlike subsgigs_watch.py (browser render, every 5 min on GitHub Actions), this
runs 24/7 on your own server and asks the JSON endpoint the page itself uses,
so new campaigns reach Telegram within a few seconds.

Configuration is read from environment variables (or a .env file next to this
script; see fast_watch.env.example):
  API_URL              endpoint that returns the campaign list as JSON
  API_HEADERS          JSON object of request headers, e.g. your Authorization
                       or Cookie value copied from the browser
  ITEMS_PATH           dot path to the list inside the response, e.g. "data.campaigns"
                       (default: the first list found)
  ID_FIELD             field that identifies a campaign (default: "id")
  TITLE_FIELDS         comma-separated fields to show in the alert (default: title,name)
  LINK_TEMPLATE        link for the alert button, e.g.
                       "https://subsgigs-alpha.vercel.app/campaigns/{id}"
  POLL_SECONDS         seconds between checks (default: 3)
  TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID   where alerts go
"""

import json
import os
import sys
import time
from pathlib import Path

import requests


def load_dotenv(path):
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip("'\""))


load_dotenv(Path(__file__).with_name(".env"))

API_URL = os.environ.get("API_URL", "")
API_HEADERS = json.loads(os.environ.get("API_HEADERS") or "{}")
ITEMS_PATH = os.environ.get("ITEMS_PATH", "")
ID_FIELD = os.environ.get("ID_FIELD") or "id"
TITLE_FIELDS = [f.strip() for f in (os.environ.get("TITLE_FIELDS") or "title,name").split(",")]
LINK_TEMPLATE = os.environ.get("LINK_TEMPLATE") or "https://subsgigs-alpha.vercel.app/campaigns"
POLL_SECONDS = float(os.environ.get("POLL_SECONDS") or 3)
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")

session = requests.Session()  # keep-alive: reuses the connection between checks


class Blocked(Exception):
    """The site's bot protection (Vercel Security Checkpoint) refused the request."""


def find_items(data):
    """Return the campaign list from the response."""
    if ITEMS_PATH:
        for key in ITEMS_PATH.split("."):
            data = data[int(key)] if isinstance(data, list) else data[key]
        return data
    if isinstance(data, list):
        return data
    # Breadth-first search for the first list of objects.
    queue = [data]
    while queue:
        node = queue.pop(0)
        if isinstance(node, dict):
            for value in node.values():
                if isinstance(value, list) and value and isinstance(value[0], dict):
                    return value
                queue.append(value)
    return []


def item_id(item):
    return str(item.get(ID_FIELD) or json.dumps(item, sort_keys=True))


def describe(item):
    for field in TITLE_FIELDS:
        if item.get(field):
            return str(item[field])
    return json.dumps(item)[:200]


def telegram(text, link=None):
    if not (TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID):
        print(f"[no Telegram configured] {text}")
        return
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": text[:4000], "disable_web_page_preview": True}
    if link:
        payload["reply_markup"] = {"inline_keyboard": [[{"text": "Open now", "url": link}]]}
    try:
        session.post(f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
                     json=payload, timeout=10)
    except requests.RequestException as exc:
        print(f"Telegram failed: {exc}", file=sys.stderr)


def fetch():
    resp = session.get(API_URL, headers=API_HEADERS, timeout=10)
    if "Vercel Security Checkpoint" in resp.text[:2000]:
        raise Blocked(f"HTTP {resp.status_code}")
    if resp.status_code in (401, 403):
        raise PermissionError(f"HTTP {resp.status_code}")
    resp.raise_for_status()
    return find_items(resp.json())


def main():
    if not API_URL:
        sys.exit("Set API_URL (see fast_watch.env.example).")

    try:
        seen = {item_id(i) for i in fetch()}
    except Blocked as exc:
        sys.exit(f"{API_URL} answered with Vercel's Security Checkpoint ({exc}), which blocks "
                 "scripts on this server. Use a data URL on another host (see README).")
    print(f"Watching {API_URL} every {POLL_SECONDS}s; {len(seen)} campaigns already listed.")
    telegram(f"Fast watcher started. {len(seen)} campaigns currently listed.")

    errors = 0
    auth_warned = False
    blocked_warned = False
    while True:
        time.sleep(POLL_SECONDS)
        try:
            items = fetch()
        except Blocked as exc:
            if not blocked_warned:
                telegram(f"Watcher is being blocked by the site's bot check ({exc}). "
                         "It keeps retrying every minute.")
                blocked_warned = True
            time.sleep(60)
            continue
        except PermissionError as exc:
            if not auth_warned:
                telegram(f"Watcher lost access ({exc}). Your login token probably expired: "
                         "copy a fresh one into .env and restart.")
                auth_warned = True
            continue
        except (requests.RequestException, ValueError, KeyError, IndexError) as exc:
            errors += 1
            if errors in (10, 100) or errors % 1000 == 0:
                telegram(f"Watcher has failed {errors} checks in a row: {exc}")
            time.sleep(min(errors, 30))  # back off while the site is down
            continue

        errors = 0
        auth_warned = False
        blocked_warned = False
        for item in items:
            key = item_id(item)
            if key not in seen:
                seen.add(key)
                try:
                    link = LINK_TEMPLATE.format(**item)
                except (KeyError, IndexError):
                    link = LINK_TEMPLATE.split("{")[0]
                print(f"NEW: {describe(item)}")
                telegram(f"NEW GIG: {describe(item)}", link)


if __name__ == "__main__":
    main()
