# SubsGigs watcher

Checks https://subsgigs-alpha.vercel.app/campaigns every ~5 minutes via GitHub Actions
and alerts you on Telegram and/or email when a new campaign appears or the page changes.

## Setup (one time)

Add these in GitHub: **repo → Settings → Secrets and variables → Actions → New repository secret**.

### Telegram
1. In Telegram, message **@BotFather**, send `/newbot`, follow the prompts. Copy the token → secret `TELEGRAM_BOT_TOKEN`.
2. Open your new bot and send it any message (e.g. `hi`).
3. Visit `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser and copy `"chat":{"id": ...}` → secret `TELEGRAM_CHAT_ID`.

### Email (Gmail)
1. Turn on 2-Step Verification on your Google account, then create an **App password** at https://myaccount.google.com/apppasswords.
2. Secrets: `SMTP_USER` = your Gmail address, `SMTP_PASSWORD` = the 16-character app password.
3. Optional: `ALERT_EMAIL_TO` if alerts should go to a different address.

## Try it
- **Actions → SubsGigs watcher → Run workflow**, tick *Send a test alert* → you should get a message.
- Run it again unticked → you get a "watcher is running" message listing the current campaigns. After that you only hear from it when something new shows up.

Scheduled workflows run only from the repository's default branch, so this starts working automatically once merged.

---

# Fast watcher (alerts within seconds)

`fast_watch.py` runs 24/7 on your own server and checks the site's data endpoint every 3 seconds,
then pushes a Telegram message with an **Open now** button.

## Blocked by Vercel's Security Checkpoint
The site's pages, including `/api/...` on `subsgigs-alpha.vercel.app`, sit behind Vercel's bot
protection. It refuses scripts and headless browsers on cloud servers (tested: HTTP 429, "Failed to
verify your browser"). Both watchers now detect this and say so instead of alerting on the block page.
The fast watcher can only work if the campaign list loads from a **different host** (for example a
`*.supabase.co` URL); step 1 below shows whether it does.

## 1. Find the data endpoint (once, in Chrome on a computer)
1. Log in to SubsGigs and open the Campaigns page.
2. Press **F12** → **Network** tab → click **Fetch/XHR** → reload the page.
3. Click each request until the **Response** (or Preview) tab shows the campaign list.
4. Right-click that request → **Copy** → **Copy as cURL**.
5. Share it with Claude **after deleting** the `Authorization` / `Cookie` / `apikey` values — those are your login and stay private.

## 2. Server setup (Oracle Cloud free tier, Ubuntu)
```bash
sudo apt update && sudo apt install -y git python3-requests
git clone https://github.com/olaide4321/gaia.git && cd gaia/watcher
cp fast_watch.env.example .env && nano .env      # fill in URL, your token, Telegram
python3 fast_watch.py                             # test: you should get "Fast watcher started"
# Ctrl+C, then run it forever (restarts on crash/reboot):
sudo cp fast-watch.service /etc/systemd/system/
sudo systemctl enable --now fast-watch
journalctl -u fast-watch -f                       # live log
```
When your login token expires, the bot messages you; paste a fresh one into `.env` and run
`sudo systemctl restart fast-watch`.
