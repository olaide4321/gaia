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
