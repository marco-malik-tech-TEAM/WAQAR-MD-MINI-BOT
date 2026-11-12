# MARCO MALIK & WAQAR WRITES MD — WhatsApp Mini Bot

## Railway deployment

1. Connect this GitHub repository to a Railway service and deploy the `main` branch.
2. Once deployment is ready, open the Railway-generated domain. The root URL redirects to the pairing page; you can also open `/pair` directly.
3. On the pairing page, enter your phone number with its country code. Enter digits only: do not include a leading `+` or an extra leading zero. Choose QR pairing or a pairing code and follow the instructions in WhatsApp under **Linked Devices**.
4. After pairing succeeds, the bot sends a `SESSION_ID` to your WhatsApp chat. Add it to Railway Variables if you need the main bot session to connect on startup, then redeploy. Keep this value private.
5. The start command is `npm start`. Railway provides `PORT` automatically; do not set it manually.

The pairing page can be opened before adding a `SESSION_ID`. A valid session is required for the bot's main WhatsApp connection.

## Railway variables

| Variable | Purpose |
|---|---|
| `SESSION_ID` | Session value received after pairing; required to start the main bot session. Treat it as a secret. |
| `PHONE` | Optional phone number, including country code, for automatic phone-code pairing. Use digits only. |
| `PREFIX` | Optional command prefix. Defaults to `.`. |
| `OWNER_NUMBER` | Optional owner phone number, including country code, using digits only. |
| `YT_COOKIES` | Optional `cookies.txt` content or path, for YouTube access when sign-in verification is required. |
| `AI_API_KEY` | Optional API key for an OpenAI-compatible AI provider. |
| `AI_BASE_URL` | Optional base URL for that AI provider. |
| `AI_MODEL` | Optional model name for that AI provider. |
| `OMDB_KEY` | Optional OMDb API key for movie information. |
| `NOPREFIX_ALL` | Optional setting for accepting commands without a prefix. Defaults to `true`. |
| `CHANNEL_CODE` | WhatsApp channel code used by the project. Leave unchanged unless you intend to configure another channel. |

Add variables in Railway's **Variables** panel. Do not commit real session IDs, API keys, cookies, or phone numbers to GitHub. The `.env.example` file contains blank placeholders only.

## Persistent sessions

To retain paired accounts across restarts and redeploys, configure Railway persistent storage for `sessions_active/` and `auth_info/`, using the mount paths `/app/sessions_active` and `/app/auth_info`. Without persistent storage, local session files may be lost during redeployment.

## Commands and help

In WhatsApp, send `help`, `.help`, or `!help` to see available commands. Examples include `.play`, `.movie`, `.ai`, `.pair`, `.owner`, and `.creator`. Command names must be entered exactly as shown.

## Security

Treat `SESSION_ID`, API keys, cookies, and any authentication files as private credentials. Never publish or share them publicly.
