# MARCO MALIK & WAQAR WRITES MD — WhatsApp Mini Bot

## Railway deployment

1. Connect this GitHub repository to a Railway service and deploy the `main` branch.
2. Open the Railway-generated domain. The root URL redirects to the pairing page; `/pair` is also available directly.
3. Pair the WhatsApp number and wait for the page to confirm the bot connection is online before sending commands.
4. Attach a persistent volume at `/app/sessions_active` for web-paired accounts. If separately using `auth_info/`, attach another volume at `/app/auth_info`.
5. Railway provides `PORT` automatically. The start command is `npm start`.

## Media commands

- `.play <song name or YouTube link>` searches for the track and attempts to send an MP3. It uses yt-dlp first and then configured public provider endpoints; sign-in challenges, provider availability, source restrictions, or WhatsApp's media-size limits can prevent a download.
- `.video <title or link>` attempts to send a video. Supported source routes include YouTube, TikTok, Instagram, and Facebook; external extractors/providers can change availability, and files that exceed the bot's attachment limits will fail.
- `.movie <name>` looks up movie details and searches for an official trailer, then attempts to send that trailer as a video. It does not search for or distribute full movie files.
- `.tiktok`, `.instagram`, and `.facebook` also accept links; social downloads depend on the upstream providers being available.

Only download or share media that you own or are authorized to use. Third-party extraction services can fail or change their interfaces, so the bot cannot guarantee that every public link will always download. `YT_COOKIES` is an optional yt-dlp cookies.txt path or content for YouTube sign-in challenges; protect it as a credential and do not commit it to GitHub.

## Environment variables

For a number paired through the website, leave `SESSION_ID` and `PHONE` blank. Do not treat the legacy `SESSION_ID` value as a backup of the complete Baileys authentication state. The full state is saved under `sessions_active/<number>` and needs the Railway volume above.

Optional variables are `PREFIX` (default `.`), `OWNER_NUMBER`, `YT_COOKIES`, `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`, `OMDB_KEY`, `NOPREFIX_ALL` (default `true`), and `CHANNEL_CODE`. See `.env.example` for placeholders. Never commit API keys, cookie data, phone numbers, or authentication files.

## Welcome messages

Group welcome cards use the participant name and phone number only when WhatsApp provides them, and attempt to load the profile image through the WhatsApp client. If the participant's privacy settings hide their image, or WhatsApp supplies a privacy-preserving identifier instead of a phone number, the card displays initials or an availability notice.

## Availability and security

The bot retries transient connection failures, but lifetime uptime cannot be guaranteed. Railway availability and plan limits, WhatsApp linked-device policies, account logout, and network conditions are external dependencies. Treat authentication data as private credentials.
