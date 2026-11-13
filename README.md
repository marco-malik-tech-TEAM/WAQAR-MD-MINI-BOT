# MARCO MALIK & WAQAR WRITES MD — WhatsApp Mini Bot

## Railway deployment

1. Connect this GitHub repository to a Railway service and deploy the `main` branch.
2. Open the Railway-generated domain. The root URL redirects to the pairing page; `/pair` is also available directly.
3. Pair the WhatsApp number and wait for the page to confirm the bot connection is online before sending commands.
4. Attach a persistent volume at `/app/sessions_active` for web-paired accounts. If separately using `auth_info/`, attach another volume at `/app/auth_info`.
5. Railway provides `PORT` automatically. The start command is `npm start`.

## Media commands

- `.video <link>` accepts a publicly accessible Telegram channel post in the form `https://t.me/channel_name/123`. The file must be under 95 MB. Private, invite-only, restricted, or unavailable posts are not supported. The command can show YouTube videos through their official watch links but does not download YouTube files.
- `.play <song>` searches for a song and shares its YouTube listening link; it does not extract MP3 files.
- `.movie <name>` returns movie information and a trailer-search link; it does not distribute full-movie files. Use licensed streaming or rental services for full movies.
- TikTok, Instagram, and Facebook downloader routes depend on external providers and may be unavailable. Only download or redistribute media you own or have permission to use.

The bundled `bin/yt-dlp` executable is used only for publicly accessible Telegram channel-post video links. The service does not use cookies, geo-bypass options, or third-party YouTube extraction endpoints.

## Environment variables

For a number paired through the website, leave `SESSION_ID` and `PHONE` blank. Do not treat the legacy `SESSION_ID` value as a backup of the complete Baileys authentication state. The full state is saved under `sessions_active/<number>` and needs the Railway volume above.

Optional variables are `PREFIX` (default `.`), `OWNER_NUMBER`, `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`, `OMDB_KEY`, `NOPREFIX_ALL` (default `true`), and `CHANNEL_CODE`. See `.env.example` for blank placeholders. Never commit API keys or authentication files.

## Welcome messages

Group welcome cards use the participant name and phone number only when WhatsApp provides them, and attempt to load the profile image through the WhatsApp client. If the participant's privacy settings hide their image, or WhatsApp supplies a privacy-preserving identifier instead of a phone number, the card displays initials or an availability notice.

## Availability and security

The bot retries transient connection failures, but lifetime uptime cannot be guaranteed. Railway availability and plan limits, WhatsApp linked-device policies, account logout, and network conditions are external dependencies. Treat authentication data as private credentials.
