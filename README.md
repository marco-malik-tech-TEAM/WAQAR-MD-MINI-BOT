# MARCO MALIK X — WhatsApp Mini Bot

## Railway deployment

1. Connect this GitHub repository to a Railway service and deploy the `main` branch.
2. Open the Railway-generated domain. The root URL redirects to the pairing page; `/pair` is also available directly.
3. Pair the WhatsApp number and wait for the page to confirm the bot connection is online before sending commands.
4. Attach a persistent volume at `/app/sessions_active` for web-paired accounts. If separately using `auth_info/`, attach another volume at `/app/auth_info`.
5. Railway provides `PORT` automatically. The start command is `npm start`.

## AI chatbot setup

The bot includes a no-command AI chat feature for private conversations and groups. Once at least one provider key is set in Railway Variables, automatic chat is on by default. Plain text messages in private chats and groups receive AI replies without a command. Use `.chatbot status` to check it and `.chatbot off` to pause replies; `.chatbot on` turns them back on. Short conversation context is held in memory and is cleared when the bot restarts. Group-wide replies can increase API usage and may create busy group chats. Set `AI_AUTO_CHAT_GROUPS=false` to limit automatic replies to private chats, or `AI_AUTO_CHAT=false` to disable automatic replies by default.

Choose one provider configuration:

- Gemini: set `GEMINI_API_KEY`; `GEMINI_MODEL` defaults to `gemini-2.5-flash`.
- OpenAI: set `OPENAI_API_KEY`; `OPENAI_MODEL` defaults to `gpt-4o-mini`.
- Any OpenAI-compatible API: set `AI_API_KEY`, `AI_BASE_URL`, and `AI_MODEL`. `AI_BASE_URL` should be the provider's API base URL, such as an endpoint ending in `/v1`.

`AI_PROVIDER=auto` tries configured providers, preferring Gemini, then OpenAI, then the compatible endpoint. It can also be set to `gemini`, `openai`, or `custom`. Never commit API keys to GitHub. Add keys only through Railway's Variables panel. Each provider may have its own billing, quotas, and model availability.

Group auto-replies are on by default when the chatbot is enabled, as requested. Bot commands continue to work alongside ordinary-chat replies. For group etiquette, set `AI_AUTO_CHAT_GROUPS=false` if needed.

## Media commands

- `.play <song name or YouTube link>` searches for the track and attempts to send an MP3. It uses yt-dlp first and then configured public provider endpoints; YouTube sign-in challenges, provider availability, source restrictions, or WhatsApp's media-size limits can prevent a download.
- `.video <title or link>` attempts to send a video. Supported source routes include YouTube, TikTok, Instagram, and Facebook; HTTP 403 and YouTube sign-in failures now return an actionable explanation, but no extractor can guarantee access to restricted media.
- `.movie <name>` looks up movie details and attempts to send a trailer. `.movie full <name>` and full-film requests are refused; the bot does not search for or distribute full copyrighted movies.
- `.tiktok`, `.instagram`, and `.facebook` also accept links; social downloads depend on the upstream providers being available.
- `.savestatus` or `.statusdl`: reply directly to a status that the linked account has received while online. The saved text/photo/video/audio is sent to the linked account's own private chat; the in-memory cache expires after 24 hours, media is limited to 32 MB, and View Once content is never cached or recovered. Reacting to a status with the connected account also continues to save it.
- `.statusreply status|on|off` controls optional automatic replies to people who directly reply to the connected account's status. Set the reply text with `.setstatusreply <text>`. This is off by default and owner-only.
- `.setbotname <name>` changes the bot menu title, `.setownername <name>` changes the owner label, and `.setmenuimage` accepts an attached or quoted image. The actual WhatsApp profile name must still be changed in WhatsApp settings. These runtime settings and the menu image are stored on the service filesystem; Railway may replace that filesystem on redeploy/restart unless a persistent volume is mounted, so reapply the settings or configure persistent storage if needed.
- `.vv` is a privacy-limited recovery tool: reply to a View Once photo, video, or voice note that you sent yourself. It refuses regular media and anyone else's View Once media, and limits recovery to 32 MB.
- `.muth` sends one playful reply per run and can be used again after a two-second per-user cooldown; it does not flood the chat with repeated messages.

The attached reference menu contained 220 commands despite stating 552. The bot registers 164 additional commands from the actual supplied list; existing commands and aliases were retained. Every added command has an individual module under `commands/catalog/`. The original `.menu` remains available; `.menu2` is a separate full registry menu that attaches the existing menu artwork and bundled welcome video, then lists all dispatcher commands in clean category cards, one icon-prefixed command per line. See [the full command catalog](docs/MENU_COMMANDS.md) for the exact list and feature limitations.

New group moderation controls require a group admin. `.antibadword words word1,word2` sets a group's custom word list; anti-spam, anti-sticker, anti-tag and mass-mention checks run when enabled. Owner controls remain owner-only. Privacy-sensitive activity rankings are not calculated from archived chat history. Commands requiring unavailable services (including image generation, TTS, Zoom, Pinterest/Twitter extraction, remote restart/update or bulk broadcast) explain that they are not configured rather than claiming success. Local economy balances are game-only; mount `/app/data` as a Railway volume if they should persist across redeploys.

Only download or share media that you own or are authorized to use. Third-party extraction services can fail or change their interfaces, so the bot cannot guarantee that every public link will always download. `YT_COOKIES` is an optional yt-dlp cookies.txt path or content for YouTube sign-in challenges; protect it as a credential and do not commit it to GitHub.

## Anti-delete

When the owner enables anti-delete (and group anti-delete is enabled for a group), ordinary deleted text and supported image/video/voice media may be restored visibly in the original chat, with an explanatory notice. Media restoration is capped at 32 MB; WhatsApp may make deleted media unavailable before recovery. View Once media is never recovered. The bot does not secretly forward deleted content to a private archive.

## Environment variables

For a number paired through the website, leave `SESSION_ID` and `PHONE` blank. Do not treat the legacy `SESSION_ID` value as a backup of the complete Baileys authentication state. The full state is saved under `sessions_active/<number>` and needs the Railway volume above.

See `.env.example` for the complete variable list. Never commit API keys, cookie data, phone numbers, or authentication files.

## Welcome messages

Group welcome cards use the participant name and phone number only when WhatsApp provides them, and attempt to load the profile image through the WhatsApp client. If the participant's privacy settings hide their image, or WhatsApp supplies a privacy-preserving identifier instead of a phone number, the card displays initials or an availability notice.

## Availability and security

The bot retries transient connection failures, but lifetime uptime cannot be guaranteed. Railway availability and plan limits, WhatsApp linked-device policies, account logout, provider quotas, and network conditions are external dependencies. Treat authentication data and AI API keys as private credentials.
