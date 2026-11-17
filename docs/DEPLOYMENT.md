# Deployment and setup

## Railway

1. Push the project to a GitHub repository and connect that repository's `main` branch to a Railway service. Keep the repository private if it contains project-specific configuration.
2. Let Railway use the repository's `nixpacks.toml`. The build runs `npm ci`, creates `.venv`, and installs yt-dlp `2026.10.26` with the default extras. Do not replace this with an older global yt-dlp install.
3. Add at least one AI provider key in Railway Variables if you want automatic chatbot replies: `GEMINI_API_KEY`, `OPENAI_API_KEY`, or the compatible trio `AI_API_KEY`, `AI_BASE_URL`, and `AI_MODEL`. `AI_PROVIDER=auto` is the default. Optional `AI_AUTO_CHAT=false` disables unsolicited replies; `AI_AUTO_CHAT_GROUPS=false` keeps them out of group chats.
4. For pairing through the web page, leave `SESSION_ID` and `PHONE` blank. Add a Railway Volume mounted at `/app/sessions_active` so the Baileys credentials survive a redeploy. If the service uses `auth_info/`, mount persistent storage at `/app/auth_info` as well. Add a volume at `/app/data` if game-economy data should persist.
5. `PORT` is supplied by Railway. The start command is `npm start`; the root URL opens the pairing flow, and `/pair` is available directly. The page uses same-origin API and Socket.IO paths, so it works on Railway's generated domain and on a correctly routed custom domain. Railway's public domain is detected automatically; if you use a custom domain, set `PUBLIC_URL=https://your-domain.example` in Railway Variables. The resulting `/pair` URL is logged at startup and displayed in the bot menu.
6. After changing source code or build configuration, deploy the latest commit again so Railway runs a new build. After changing a variable, restart/redeploy the service.

Commands require the literal leading dot, for example `.menu` and `.play`. Bare command names and alternate prefixes are intentionally ignored. Both `.menu` and `.menu2` send the complete boxed command list and inline menu artwork in one WhatsApp message. The welcome video is sent by the pairing-success greeting; it is not sent as a separate message by `.menu2`.

### Optional download configuration

`YT_DLP_PATH` may point to a custom executable but should normally be left unset; the bot tries the Nixpacks-created `.venv/bin/yt-dlp` first. `YT_COOKIES` is optional and only for an account session you are authorized to use. If set, store a valid `cookies.txt` export as a private Railway variable. Never put the file or cookie contents in GitHub, screenshots, chat, or build logs. Revoke/re-export the session if it is exposed.

YouTube, TikTok, Instagram and other media downloads depend on external source policies, provider uptime, Railway network/IP access, media size and WhatsApp availability. Multiple fallbacks are attempted, but no remote extractor can promise a successful download for every link. Full-film downloads are intentionally blocked; `.movie` is for film information and trailers.

## Local setup and checks

Requirements: Node.js 20 or newer, Python 3, FFmpeg, and access to the required environment variables. In the project directory run:

```sh
npm ci
python3 -m venv .venv
.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install --no-cache-dir 'yt-dlp[default]==2026.10.26'
npm test
npm run audit:commands
npm start
```

`npm test` runs the automated regression suite. `npm run audit:commands` invokes each registered handler once with an offline mock socket and writes the complete command/alias status matrix to `docs/COMMAND_STATUS.md`. It is a no-network smoke check, not a live test of provider keys or WhatsApp access.

## Security note

The bot requires linked-device authentication data and any configured AI or media credentials. Keep them in Railway Variables or a local untracked `.env`; never commit them. Revoke and replace any key or session cookie that has appeared in a message, screenshot or repository history.
