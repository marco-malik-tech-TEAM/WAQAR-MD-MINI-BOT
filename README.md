# MARCO MALIK & WAQAR WRITES MD — WhatsApp Mini Bot

## Railway deployment

1. Connect this GitHub repository to a Railway service and deploy the `main` branch.
2. Open the Railway-generated domain. The root URL redirects to the pairing page; `/pair` is also available directly.
3. Enter the phone number with its country code. Use digits only—do not include `+` or an extra leading zero. Choose QR pairing or a pairing code and follow WhatsApp's **Linked Devices** instructions.
4. Wait for the pairing page to confirm that the bot connection is online before sending commands. The bot starts a permanent socket from the complete saved authentication state; a successful code entry alone does not mean that this replacement socket is ready.
5. Railway provides `PORT` automatically. The start command is `npm start`.

## Persistent storage is required

The complete Baileys authentication state for web-paired numbers is stored in `sessions_active/<number>`. In Railway, attach a persistent volume to the service at **`/app/sessions_active`**. If you separately run a main bot account using `auth_info/`, attach persistent storage at **`/app/auth_info`** as well. Without the appropriate volume, Railway can discard the authentication files during a restart or redeployment, and the account may go offline or require pairing again.

For a number paired through the website, leave both `SESSION_ID` and `PHONE` blank. `PHONE` starts a separate direct pairing attempt at app startup. The older `SESSION_ID` fallback contains credentials only; it does not replace the complete Baileys authentication directory and is not a reliable long-term session backup. The website-pairing flow saves the full state itself and does not require either variable.

## Environment variables

No custom variable is required just to open the pairing page. Add optional settings in Railway's **Variables** panel only when you use the corresponding feature.

| Variable | Purpose |
|---|---|
| `SESSION_ID` | Legacy compatibility only; leave blank. It is not a substitute for persistent auth-state storage. |
| `PHONE` | Optional number for direct main-account pairing at startup. Leave blank when pairing through `/pair`. |
| `PREFIX` | Optional command prefix; defaults to `.`. |
| `OWNER_NUMBER` | Optional owner number, including country code, using digits only. |
| `YT_COOKIES` | Optional `cookies.txt` content or file path if YouTube requests sign-in verification. |
| `AI_API_KEY` | Optional key for an OpenAI-compatible AI provider. |
| `AI_BASE_URL` | Optional base URL for that AI provider. |
| `AI_MODEL` | Optional model name for that AI provider. |
| `OMDB_KEY` | Optional OMDb API key for movie information. |
| `NOPREFIX_ALL` | Accept commands without a prefix; defaults to `true`. |
| `CHANNEL_CODE` | WhatsApp channel code used by the project. Leave unchanged unless configuring another channel. |

`.env.example` contains placeholders only. Never commit real session data, API keys, cookies, phone numbers, or authentication files to GitHub.

## Commands and help

In WhatsApp, send `help`, `.help`, or `!help` to see available commands. Examples include `.play`, `.movie`, `.ai`, `.pair`, `.owner`, and `.creator`. Enter command names exactly as shown.

## Availability and security

The bot can reconnect after transient network or WhatsApp disconnects, and Railway can restart a process after a failure within the limits of the service plan. No code can guarantee lifetime uptime: Railway service availability and billing, WhatsApp's linked-device policy, account logout, and network conditions remain external dependencies. Treat all authentication data as private credentials.
