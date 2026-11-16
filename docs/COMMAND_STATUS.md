# Command handler smoke audit

Generated at 2026-11-16T02:56:21.900Z by `node scripts/audit-commands.mjs`.

Registered handlers: **281** (267 passed, 14 conditional, 0 failed). Supported aliases: **40** (40 target checks passed). JavaScript files under `commands/`: **248**; individual catalog wrappers: **164**.

> Scope: each handler was invoked once with no arguments using a mocked WhatsApp socket and disabled network calls. Deliberate animation delays were fast-forwarded. PASS means the local handler completed without an uncaught exception. CONDITIONAL means the result indicates an unavailable provider, missing configuration, permissions, or input needed for a real run. FAIL means an uncaught exception or timeout. This smoke run does not certify live APIs, credentials, media access, or every command-specific input. No WhatsApp message or third-party request was sent by this audit.

## Registered command handlers

| Command | Offline smoke | Result/response excerpt |
|---|---|---|
| `.1917` | PASS | handler completed |
| `.8ball` | PASS | ╔══════════════════════════════════╗ ║ 🎱 *𝕄𝔸𝔾𝕀ℂ 𝟠-𝔹𝔸𝕃𝕃* 🎱 ║ ╚══════════════════════════════════╝ ❓ Ask me a yes/no question! *Usage:* .8ball Will I pass my exams? |
| `.add` | PASS | ╔══════════════════════════════════╗ ║ ➕ *𝔸𝔻𝔻 𝕄𝔼𝕄𝔹𝔼ℝ* ➕ ║ ╚══════════════════════════════════╝ *Usage:* .add [number redacted] Include country code without + or spaces. |
| `.admins` | PASS | handler completed |
| `.aesthetic` | PASS | ╔══════════════════════════════════╗ ║ ✨ *𝔸𝔼𝕊𝕋ℍ𝔼𝕋𝕀ℂ 𝕋𝔼𝕏𝕋* ✨ ║ ╚══════════════════════════════════╝ *Usage:* .aesthetic <text> *Example:* .aesthetic hello world |
| `.afk` | PASS | 🚫 Owner-only command. |
| `.ai` | PASS | 🤖 *MARCO MALIK X AI* *Usage:* .ai <your question> • .ai Explain quantum physics simply • .ai Write a poem about friendship • .ai aapko kisne banaya? 🧠 _Powered by MARCO MALIK X_ |
| `.alwaysonline` | PASS | ╔══════════════════════════════════╗ ║ ❓ *ℍ𝔼𝕃ℙ* ❓ ║ ╚══════════════════════════════════╝ 📝 *U𝕤𝕒𝕘𝕖:* .alwaysonline on/off 📌 *𝔼𝕩𝕒𝕞𝕡𝕝𝕖:* .alwaysonline on |
| `.alwaysrecording` | PASS | ╔══════════════════════════════════╗ ║ ❓ *ℍ𝔼𝕃ℙ* ❓ ║ ╚══════════════════════════════════╝ 📝 *U𝕤𝕒𝕘𝕖:* .alwaysrecording on/off 📌 *𝔼𝕩𝕒𝕞𝕡𝕝𝕖:* .alwaysrecording on |
| `.alwaystyping` | PASS | ╔══════════════════════════════════╗ ║ ❓ *ℍ𝔼𝕃ℙ* ❓ ║ ╚══════════════════════════════════╝ 📝 *U𝕤𝕒𝕘𝕖:* .alwaystyping on/off 📌 *𝔼𝕩𝕒𝕞𝕡𝕝𝕖:* .alwaystyping on |
| `.antibadword` | PASS | 🛡️ antibadword: OFF. |
| `.antibot` | CONDITIONAL | WhatsApp does not expose reliable bot-account identification to this bot, so antibot enforcement is unavailable and has not been enabled. |
| `.anticall` | PASS | ╔══════════════════════════════════╗ ║ ❓ *ℍ𝔼𝕃ℙ* ❓ ║ ╚══════════════════════════════════╝ 📝 *U𝕤𝕒𝕘𝕖:* .anticall on/off 📌 *𝔼𝕩𝕒𝕞𝕡𝕝𝕖:* .anticall on |
| `.antidelete` | PASS | ╔══════════════════════════════════╗ ║ ❓ *ℍ𝔼𝕃ℙ* ❓ ║ ╚══════════════════════════════════╝ 📝 *U𝕤𝕒𝕘𝕖:* .antidelete on/off 📌 *𝔼𝕩𝕒𝕞𝕡𝕝𝕖:* .antidelete on |
| `.antigroupmention` | PASS | 🛡️ antigroupmention: OFF. |
| `.antigroupstatus` | PASS | 🛡️ antigroupstatus: OFF. |
| `.antilink` | PASS | ╔══════════════════════════════════╗ ║ 🔗 *𝔸ℕ𝕋𝕀𝕃𝕀ℕ𝕂 𝕊𝕐𝕊𝕋𝔼𝕄* 🔗 ║ ╚══════════════════════════════════╝ *Status:* ❌ Disabled ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ *Commands: |
| `.antispam` | PASS | 🛡️ antispam: OFF. |
| `.antisticker` | PASS | 🛡️ antisticker: OFF. |
| `.antitag` | PASS | 🛡️ antitag: OFF. |
| `.apk` | PASS | 📦 *APK DOWNLOADER* 📝 Usage: .apk <app name or package> 📌 Example: .apk whatsapp 📌 Example: .apk com.instagram.android |
| `.arena` | PASS | handler completed |
| `.attp` | PASS | Usage: .attp <text> |
| `.autolevelup` | PASS | ℹ️ Automatic level-up is disabled to keep balances predictable; use .levelup when you choose. |
| `.autolikestatus` | PASS | ╔══════════════════════════════════╗ ║ ❓ *ℍ𝔼𝕃ℙ* ❓ ║ ╚══════════════════════════════════╝ 📝 *U𝕤𝕒𝕘𝕖:* .autolikestatus on/off 📌 *𝔼𝕩𝕒𝕞𝕡𝕝𝕖:* .autolikestatus on |
| `.autoreact` | PASS | 🚫 Owner-only command. |
| `.autoread` | PASS | ╔══════════════════════════════════╗ ║ ❓ *ℍ𝔼𝕃ℙ* ❓ ║ ╚══════════════════════════════════╝ 📝 *U𝕤𝕒𝕘𝕖:* .autoread on/off 📌 *𝔼𝕩𝕒𝕞𝕡𝕝𝕖:* .autoread on |
| `.autostatus` | PASS | 🚫 Owner-only command. |
| `.autosticker` | PASS | 🛡️ autosticker: OFF. |
| `.autoviewstatus` | PASS | ╔══════════════════════════════════╗ ║ ❓ *ℍ𝔼𝕃ℙ* ❓ ║ ╚══════════════════════════════════╝ 📝 *U𝕤𝕒𝕘𝕖:* .autoviewstatus on/off 📌 *𝔼𝕩𝕒𝕞𝕡𝕝𝕖:* .autoviewstatus on |
| `.babyname` | PASS | 👶 Name idea: Lina. |
| `.balance` | PASS | 💰 Balance: 0 coins ⭐ XP: 0 🎒 Items: 0 🎖️ Role: Newcomer |
| `.base64` | PASS | ╔══════════════════════════════════╗ ║ 🔣 *𝔹𝔸𝕊𝔼𝟞𝟜* 🔣 ║ ╚══════════════════════════════════╝ *Usage:* • *.base64 encode* <text> • *.base64 decode* <encoded text> *Example:* • |
| `.bestie` | PASS | 🤝 @[number redacted] has been nominated as today's bestie! |
| `.bet` | PASS | 🎮 This is a chat-only, no-stakes bot. Betting, wagering, and explosive/prank payloads are disabled. |
| `.bite` | PASS | 🧛 A pretend cartoon nibble for @[number redacted]. |
| `.blackpink` | PASS | handler completed |
| `.block` | PASS | ╔══════════════════════════════════╗ ║ ❓ *ℍ𝔼𝕃ℙ* ❓ ║ ╚══════════════════════════════════╝ 📝 *𝕌𝕤𝕒𝕘𝕖 𝕚𝕟 𝔾𝕣𝕠𝕦𝕡𝕤:* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ • Mention: *.block  |
| `.bomb` | PASS | 🎮 This is a chat-only, no-stakes bot. Betting, wagering, and explosive/prank payloads are disabled. |
| `.bonk` | PASS | 🪄 A soft cartoon bonk with a foam mallet for @[number redacted]. |
| `.bot` | PASS | *Status:* ✅ Active *Usage:* .bot on/off |
| `.botstats` | PASS | ╔══════════════════════════════════╗ ║ 📊 *MARCO MALIK & WAQAR WRITES 𝔹𝕆𝕋 𝕊𝕋𝔸𝕋𝕊* 📊 ║ ╚══════════════════════════════════╝ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 🖥️ *𝕊𝕐𝕊𝕋� |
| `.bratgpt` | PASS | Usage: .bratgpt <text> |
| `.broadcast` | PASS | 🚫 Owner-only command. |
| `.buy` | PASS | Available: fishing rod, compass, tool kit. |
| `.calc` | PASS | ╔══════════════════════════════════╗ ║ 🔢 *MARCO MALIK & WAQAR WRITES ℂ𝔸𝕃ℂ𝕌𝕃𝔸𝕋𝕆ℝ* 🔢 ║ ╚══════════════════════════════════╝ 📝 *𝕌𝕤𝕒𝕘𝕖:* .calc [expression] 📌 *𝔼𝕩𝕒𝕞� |
| `.caption` | PASS | 📝 Caption idea: “Keep it simple, keep it kind.” |
| `.chai` | PASS | handler completed |
| `.character` | PASS | 🎭 Your chat character today: The Friendly Comedian. |
| `.chatbot` | PASS | 🤖 *AI Chatbot Status* Status: ON Provider(s): openai Group auto-replies: enabled Use .chatbot on/off to change the setting. 💠 *Powered by MARCO MALIK X* 🌐 https://marco-waqar-mi |
| `.choose` | PASS | 🎯 I choose: option A. |
| `.chop` | PASS | 🌿 You found a pinecone. (role-play only; no real stakes). |
| `.clean` | PASS | 🧹 Message cleanup is not enabled: WhatsApp does not provide a safe bulk-delete API for arbitrary chat history. |
| `.coinflip` | PASS | ╔══════════════════════════════════╗ ║ 🪙 *ℂ𝕆𝕀ℕ 𝔽𝕃𝕀ℙ* 🪙 ║ ╚══════════════════════════════════╝ 🪙 *Flipping...* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 🦅 *TAILS!* 🦅 ━━━━━━━━━━━━ |
| `.compatibility` | PASS | ╔══════════════════════════════════╗ ║ 💞 *ℂ𝕆𝕄ℙ𝔸𝕋𝕀𝔹𝕀𝕃𝕀𝕋𝕐* 💞 ║ ╚══════════════════════════════════╝ *Usage:* .compatibility <name1> & <name2> *Examples:* • *.compatibili |
| `.compliment` | PASS | ╔══════════════════════════════════╗ ║ 🌟 *ℂ𝕆𝕄ℙ𝕃𝕀𝕄𝔼ℕ𝕋* 🌟 ║ ╚══════════════════════════════════╝ You're the human version of a standing ovation 👏 ━━━━━━━━━━━━━━━━━━━━━━━━━━ |
| `.confess` | PASS | ╔══════════════════════════════════╗ ║ 🤫 *𝔸ℕ𝕆ℕ ℂ𝕆ℕ𝔽𝔼𝕊𝕊* 🤫 ║ ╚══════════════════════════════════╝ *Usage:* .confess <your confession> 💡 Your confession will be sent anonym |
| `.crash` | PASS | handler completed |
| `.creator` | PASS | handler completed |
| `.crime` | PASS | ✅ Crime complete: +31 coins and +10 XP. Balance: 31. |
| `.crop` | PASS | Reply to an image with .crop. |
| `.crush` | PASS | ╔══════════════════════════════════╗ ║ 💘 *ℂℝ𝕌𝕊ℍ 𝔾𝕌𝕀𝔻𝔼* 💘 ║ ╚══════════════════════════════════╝ Choose your stage, king 👑 🎯 *.crush approach* _How to approach her & make |
| `.cuddle` | PASS | 🧸 A cozy fictional cuddle for @[number redacted] — only if welcome. |
| `.daily` | PASS | ✅ Daily complete: +100 coins and +10 XP. Balance: 131. |
| `.dare` | PASS | ╔══════════════════════════════════╗ ║ 😈 *𝕋ℝ𝕌𝕋ℍ 𝕆ℝ 𝔻𝔸ℝ𝔼* 😈 ║ ║ ━━ *𝔻𝔸ℝ𝔼* ━━ ║ ╚══════════════════════════════════╝ 🔥 *𝕐𝕆𝕌ℝ ℂℍ𝔸𝕃𝕃𝔼ℕ𝔾𝔼:* ⚡ Tell the group your m |
| `.dateidea` | PASS | ╔══════════════════════════════════╗ ║ 💑 *𝔻𝔸𝕋𝔼 𝕀𝔻𝔼𝔸* 💑 ║ ╚══════════════════════════════════╝ 🎯 *Arcade / bowling night 🎳* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 💰 *Budget |
| `.debate` | PASS | 🗣️ Debate topic: Are books better than films? |
| `.define` | PASS | ╔══════════════════════════════════╗ ║ 📖 *𝔻𝕀ℂ𝕋𝕀𝕆ℕ𝔸ℝ𝕐* 📖 ║ ╚══════════════════════════════════╝ *Usage:* .define <word> *Example:* .define serendipity |
| `.delete` | PASS | Reply to a message with .delete. |
| `.delgcstatus` | PASS | Group status deletion is not supported by WhatsApp's official message controls. |
| `.demote` | PASS | ╔══════════════════════════════════╗ ║ 📉 *𝔻𝔼𝕄𝕆𝕋𝔼 𝔸𝔻𝕄𝕀ℕ* 📉 ║ ╚══════════════════════════════════╝ *Usage:* .demote @user *Alt:* Reply to a message with .demote |
| `.dep` | PASS | Usage: .dep <amount> (1–1,000,000) |
| `.detective` | PASS | handler completed |
| `.devil` | PASS | handler completed |
| `.dice` | PASS | ╔══════════════════════════════════╗ ║ 🎲 *𝔻𝕀ℂ𝔼 ℝ𝕆𝕃𝕃* 🎲 ║ ╚══════════════════════════════════╝ 🎲 Die 1: ⚁ *2* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 💯 *Total:* 2 ━━━━━━━━━━━━━ |
| `.divorce` | PASS | 📄 The imaginary sitcom duo has agreed to share the remote. |
| `.economy` | PASS | 💰 Balance: 131 coins ⭐ XP: 20 🎒 Items: 0 🎖️ Role: Newcomer |
| `.enemy` | PASS | 🤺 @[number redacted] is your friendly rival in a completely imaginary story. |
| `.facebook` | PASS | 📘 *Facebook DOWNLOADER* 📝 Usage: .facebook <link> 📌 Example: .facebook https://www.facebook.com/watch?v=xxxx 💠 *Powered by MARCO MALIK X* 🌐 https://marco-waqar-mini-bot-info-w |
| `.fact` | PASS | ╔══════════════════════════════════╗ ║ 🧠 *MARCO MALIK & WAQAR WRITES 𝔽𝔸ℂ𝕋 ℤ𝕆ℕ𝔼* 🧠 ║ ╚══════════════════════════════════╝ 💡 *𝔻𝕚𝕕 𝕪𝕠𝕦 𝕜𝕟𝕠𝕨?* Bananas are berries, bu |
| `.fancy` | PASS | ╔══════════════════════════════════╗ ║ ✨ *𝔽𝔸ℕℂ𝕐 𝕋𝔼𝕏𝕋 𝕄𝔸𝕂𝔼ℝ* ✨ ║ ╚══════════════════════════════════╝ 📝 *𝕌𝕤𝕒𝕘𝕖:* .fancy [your text] 📌 *𝔼𝕩𝕒𝕞𝕡𝕝𝕖:* .fancy MARC |
| `.feed` | PASS | 🍪 A virtual cookie for @[number redacted]. |
| `.fire` | PASS | handler completed |
| `.fish` | PASS | 🌿 You found a pinecone. (role-play only; no real stakes). |
| `.flirt` | PASS | ╔══════════════════════════════════╗ ║ 💘 *𝔽𝕃𝕀ℝ𝕋 𝔸𝕊𝕊𝕀𝕊𝕋𝔸ℕ𝕋* 💘 ║ ╚══════════════════════════════════╝ ✉️ *Message to send her:* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ _"Hey |
| `.forage` | PASS | 🌿 You collected a few berries. (role-play only; no real stakes). |
| `.fortune` | PASS | 🔮 Take a break and drink some water. (for entertainment only) |
| `.gayrate` | PASS | 🏳️‍🌈 Fun rating for @[number redacted]: 43% (just a joke; no assumptions about anyone). |
| `.getpp` | CONDITIONAL | That profile photo is unavailable or hidden by WhatsApp privacy settings. |
| `.github` | PASS | ╔══════════════════════════════════╗ ║ 🐙 *𝔾𝕀𝕋ℍ𝕌𝔹 𝕃𝕆𝕆𝕂𝕌ℙ* 🐙 ║ ╚══════════════════════════════════╝ *Usage:* .github <username> *Example:* .github torvalds |
| `.glitch` | PASS | handler completed |
| `.goodbye` | PASS | ╔══════════════════════════════════╗ ║ 👋 *𝔾𝕆𝕆𝔻𝔹𝕐𝔼 𝕊𝕐𝕊𝕋𝔼𝕄* 👋 ║ ╚══════════════════════════════════╝ *Status:* ❌ Disabled *Current message:* ╔═════════════════════════ |
| `.goodmorning` | PASS | ╔══════════════════════════════════╗ ║ 🌅 *𝔾𝕆𝕆𝔻 𝕄𝕆ℝℕ𝕀ℕ𝔾* 🌅 ║ ╚══════════════════════════════════╝ 💌 *Send this to your babe:* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ _"Every m |
| `.goodnight` | PASS | ╔══════════════════════════════════╗ ║ 🌙 *𝔾𝕆𝕆𝔻 ℕ𝕀𝔾ℍ𝕋* 🌙 ║ ╚══════════════════════════════════╝ 💌 *Send this to your babe:* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ _"One more d |
| `.groupantidelete` | PASS | ╔══════════════════════════════════╗ ║ 🛡️ *𝔾ℝ𝕆𝕌ℙ 𝔸ℕ𝕋𝕀-𝔻𝔼𝕃𝔼𝕋𝔼* 🛡️ ║ ╚══════════════════════════════════╝ *Status:* ❌ Disabled ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ *Comma |
| `.groupinfo` | PASS | ╔══════════════════════════════════╗ ║ 📊 *𝔾ℝ𝕆𝕌ℙ 𝕀ℕ𝔽𝕆* 📊 ║ ╚══════════════════════════════════╝ 📛 *Name:* Offline Audit 🆔 *ID:* [number redacted]@g.us 📝 *Description:* _N |
| `.grouplink` | PASS | ╔══════════════════════════════════╗ ║ 🔗 *𝔾ℝ𝕆𝕌ℙ 𝕃𝕀ℕ𝕂* 🔗 ║ ╚══════════════════════════════════╝ https://chat.whatsapp.com/offline-code Share this link to invite people! |
| `.groupstats` | PASS | 📊 *Offline Audit* Members: 2 Admins: 2 Created: Not provided |
| `.groupstatus` | PASS | Group status management is not exposed by the current WhatsApp library; no setting was changed. |
| `.guessnumber` | PASS | 🔢 Guess a number from 1 to 10: 6 (example round; start your own guess). |
| `.hack` | PASS | handler completed |
| `.hacker` | PASS | handler completed |
| `.handhold` | PASS | 🤝 A friendly virtual handhold for @[number redacted]. |
| `.hangman` | PASS | 🎮 Hangman word: _ _ _ _ (4 letters). Reply in chat to play; this lightweight mode does not persist turns. |
| `.help` | PASS | handler completed |
| `.hidetag` | PASS | handler completed |
| `.highfive` | PASS | 🙌 High-five, @[number redacted]! |
| `.horoscope` | PASS | ✨ Horoscope-style note: focus on one small goal today, and make time to rest. For entertainment only. |
| `.horse` | PASS | 🎮 This is a chat-only, no-stakes bot. Betting, wagering, and explosive/prank payloads are disabled. |
| `.hotseat` | PASS | 🔥 Hot seat: What small thing always makes you smile? |
| `.howdumb` | PASS | 🧠 Nobody's intelligence can be measured by a chat command. Let's keep it kind. |
| `.howgay` | PASS | 🏳️‍🌈 Identity is personal and cannot be measured by a bot. Try .rate for a harmless random score. |
| `.hug` | PASS | 🤗 A virtual hug for @[number redacted] — only if welcome. |
| `.hunt` | PASS | 🌿 You collected a few berries. (role-play only; no real stakes). |
| `.ice` | PASS | handler completed |
| `.igs` | PASS | 📸 *Instagram DOWNLOADER* 📝 Usage: .instagram <link> 📌 Example: .instagram https://www.instagram.com/reel/xxxx 💠 *Powered by MARCO MALIK X* 🌐 https://marco-waqar-mini-bot-info- |
| `.igsc` | PASS | 📸 *Instagram DOWNLOADER* 📝 Usage: .instagram <link> 📌 Example: .instagram https://www.instagram.com/reel/xxxx 💠 *Powered by MARCO MALIK X* 🌐 https://marco-waqar-mini-bot-info- |
| `.igsf` | PASS | 📸 *Instagram DOWNLOADER* 📝 Usage: .instagram <link> 📌 Example: .instagram https://www.instagram.com/reel/xxxx 💠 *Powered by MARCO MALIK X* 🌐 https://marco-waqar-mini-bot-info- |
| `.imagine` | CONDITIONAL | Image generation is not configured for this bot. No image request was sent or billed. |
| `.impressive` | PASS | handler completed |
| `.instagram` | PASS | 📸 *Instagram DOWNLOADER* 📝 Usage: .instagram <link> 📌 Example: .instagram https://www.instagram.com/reel/xxxx 💠 *Powered by MARCO MALIK X* 🌐 https://marco-waqar-mini-bot-info- |
| `.insult` | PASS | 😄 Friendly roast for @[number redacted]: your Wi-Fi has more commitment than your plans. Just a joke! |
| `.ip` | PASS | ╔══════════════════════════════════╗ ║ 🌐 *𝕀ℙ 𝕃𝕆𝕆𝕂𝕌ℙ* 🌐 ║ ╚══════════════════════════════════╝ *Usage:* .ip <address or domain> *Example:* • *.ip 8.8.8.8* • *.ip google.com* |
| `.iqrate` | PASS | 🧠 @[number redacted]'s quiz-energy today: 84% — for fun only. |
| `.jail` | PASS | 🔒 @[number redacted] has been sentenced to one minute of good vibes. (Role-play only.) |
| `.joke` | PASS | ╔══════════════════════════════════╗ ║ 😂 *MARCO MALIK & WAQAR WRITES 𝕁𝕆𝕂𝔼 𝕋𝕀𝕄𝔼* 😂 ║ ╚══════════════════════════════════╝ What do you call a fake noodle? An impasta! ━━━━━ |
| `.kick` | PASS | ╔══════════════════════════════════╗ ║ 🦶 *𝕂𝕀ℂ𝕂 𝕄𝔼𝕄𝔹𝔼ℝ* 🦶 ║ ╚══════════════════════════════════╝ *Usage:* .kick @user *Alt:* Reply to a message with .kick |
| `.kiss` | PASS | 💋 A virtual friendly kiss sent to @[number redacted] — use only if welcome. |
| `.konachan` | CONDITIONAL | ❌ .konachan could not complete: Offline command audit: external network disabled.; log: [Catalog] .konachan failed: Offline command audit: external network disabled. |
| `.leave` | PASS | handler completed; log: 📝 Saved invite code for Offline Audit before leaving. |
| `.leaves` | PASS | handler completed |
| `.levelup` | PASS | ⭐ Level up! You are now level 2. |
| `.light` | PASS | handler completed |
| `.loveletter` | PASS | ╔══════════════════════════════════╗ ║ 💌 *𝕃𝕆𝕍𝔼 𝕃𝔼𝕋𝕋𝔼ℝ* 💌 ║ ╚══════════════════════════════════╝ *Dear My Love,* 🌹 From the moment I first saw you, I knew something insi |
| `.lovemsg` | PASS | ╔══════════════════════════════════╗ ║ 💌 *𝕃𝕆𝕍𝔼 𝕄𝔼𝕊𝕊𝔸𝔾𝔼* 💌 ║ ╚══════════════════════════════════╝ ❤️ *For your special someone:* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ _"I  |
| `.lyrics` | PASS | ╔══════════════════════════════════╗ ║ 🎵 *𝕃𝕐ℝ𝕀ℂ𝕊 𝔽𝕀ℕ𝔻𝔼ℝ* 🎵 ║ ╚══════════════════════════════════╝ *Usage:* .lyrics <song name> *Example:* .lyrics Blinding Lights |
| `.marry` | PASS | 💍 A pretend friendship badge is awarded to @[number redacted]; this is not a real marriage. |
| `.matrix` | PASS | handler completed |
| `.meme` | CONDITIONAL | ❌ *Failed to fetch meme* _Try again in a moment!_ 🔄; log: ❌ Meme error: Offline command audit: external network disabled. |
| `.memegen` | PASS | handler completed |
| `.memesearch` | PASS | 😂 Meme idea: When the Wi-Fi reconnects exactly as the meeting ends. |
| `.mentionking` | PASS | 👑 Mention leaderboard needs stored activity data; it is not collected by this bot yet. |
| `.menu2` | PASS | handler completed |
| `.metallic` | PASS | handler completed |
| `.mine` | PASS | ⏳ You can use .mine again after the cooldown. |
| `.mode` | PASS | 🚫 Owner-only command. |
| `.mood` | PASS | 🌤️ Mood check: focused. |
| `.mostactive` | CONDITIONAL | 🔒 Activity rankings are unavailable because the bot does not archive group chat history. |
| `.mostquiet` | CONDITIONAL | 🔒 Activity rankings are unavailable because the bot does not archive group chat history. |
| `.movie` | PASS | 🎬 *MOVIE INFO + TRAILER* 📝 Usage: .movie <name> 📌 Example: .movie Avengers Endgame 💠 *Powered by MARCO MALIK X* 🌐 https://marco-waqar-mini-bot-info-web.vercel.app |
| `.mute` | PASS | ╔══════════════════════════════════╗ ║ 🔇 *𝔾ℝ𝕆𝕌ℙ 𝕄𝕌𝕋𝔼𝔻* 🔇 ║ ╚══════════════════════════════════╝ 🔒 *Group is now closed.* Only admins can send messages. Use *.unmute* to  |
| `.muth` | PASS | handler completed |
| `.myactivity` | PASS | 🔒 This bot does not archive or score private chat history. Your activity command is privacy-limited and no historical usage data is stored. |
| `.neko` | CONDITIONAL | ❌ .neko could not complete: Offline command audit: external network disabled.; log: [Catalog] .neko failed: Offline command audit: external network disabled. |
| `.neon` | PASS | handler completed |
| `.news` | PASS | ╔══════════════════════════════════╗ ║ 📰 *ℕ𝔼𝕎𝕊 𝕌ℕ𝔸𝕍𝔸𝕀𝕃𝔸𝔹𝕃𝔼* 📰 ║ ╚══════════════════════════════════╝ ⚠️ Unable to fetch live headlines. ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
| `.newsletter` | PASS | 🚫 Owner-only command. |
| `.nhie` | PASS | 🙋 Never have I ever: laughed at my own joke |
| `.nightowl` | CONDITIONAL | 🔒 Night-owl rankings are unavailable because the bot does not archive chat timestamps. |
| `.owner` | PASS | handler completed |
| `.pair` | PASS | 🔗 *PAIR YOUR WHATSAPP* 📝 Usage: .pair <your number with country code> 📌 Example: .pair [number redacted] 🌐 Or use the website: https://marco-waqar-mini-bot-info-web.vercel.app  |
| `.password` | PASS | ╔══════════════════════════════════╗ ║ 🔐 *ℙ𝔸𝕊𝕊𝕎𝕆ℝ𝔻 𝔾𝔼ℕ* 🔐 ║ ╚══════════════════════════════════╝ 🔑 *Your Password:* ```?&m[7^T!:VK3^j)j``` ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
| `.pat` | PASS | 🫳 A gentle, virtual pat for @[number redacted]. |
| `.pay` | PASS | Usage: .pay <amount> (1–1,000,000) |
| `.pending` | PASS | Pending join requests are not exposed consistently by the current WhatsApp library. |
| `.pick` | PASS | 🎲 Random pick: B. |
| `.pickup` | PASS | ╔══════════════════════════════════╗ ║ 💘 *ℙ𝕀ℂ𝕂𝕌ℙ 𝕃𝕀ℕ𝔼* 💘 ║ ╚══════════════════════════════════╝ Is your name Netflix? Because I could watch you for hours. 📺 ━━━━━━━━━━━━━━ |
| `.pies` | PASS | 🥧 A pretend pie gently lands near @[number redacted]. No real-world action. |
| `.ping` | PASS | ╔══════════════════════════════════╗ ║ 🏓 *ℙ𝕆ℕ𝔾!* 🏓 ║ ╚══════════════════════════════════╝ ⚡ *ℝ𝕖𝕤𝕡𝕠𝕟𝕤𝕖 𝕋𝕚𝕞𝕖:* 0ms 🟢 *𝕊𝕥𝕒𝕥𝕦𝕤:* Bot is online! ━━━━━━━━━━━━━━━━━━ |
| `.pinterest` | PASS | This source is not supported by the configured downloader. Use .instagram or .video with a public link; private or restricted posts cannot be fetched. |
| `.play` | PASS | 🎵 *MUSIC / MP3 DOWNLOADER* 📝 Usage: .play <song name or YouTube link> 📌 Example: .play Light Jesus 💠 *Powered by MARCO MALIK X* 🌐 https://marco-waqar-mini-bot-info-web.vercel. |
| `.pmblocker` | PASS | 🚫 Owner-only command. |
| `.poke` | PASS | 👉 A light, imaginary poke for @[number redacted]. |
| `.poll` | PASS | ╔══════════════════════════════════╗ ║ 📊 *ℂℝ𝔼𝔸𝕋𝔼 ℙ𝕆𝕃𝕃* 📊 ║ ╚══════════════════════════════════╝ *Usage:* .poll Question \| Option1 \| Option2 \| ... *Example:* .poll Best pro |
| `.prefix` | PASS | ╔══════════════════════════════════╗ ║ ⚙️ *𝔹𝕆𝕋 ℙℝ𝔼𝔽𝕀𝕏* ⚙️ ║ ╚══════════════════════════════════╝ *Current Prefix:* . ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 💡 *ℍ𝕆𝕎 𝕋𝕆 ℂℍ𝔸ℕ� |
| `.profession` | PASS | 🧭 Today's imaginary profession: planet explorer. |
| `.promote` | PASS | ╔══════════════════════════════════╗ ║ 👑 *ℙℝ𝕆𝕄𝕆𝕋𝔼 𝕋𝕆 𝔸𝔻𝕄𝕀ℕ* 👑 ║ ╚══════════════════════════════════╝ *Usage:* .promote @user *Alt:* Reply to a message with .promote |
| `.punch` | PASS | 🥊 A pretend pillow-punch sound effect for @[number redacted]; no real violence. |
| `.purple` | PASS | handler completed |
| `.qr` | PASS | ╔══════════════════════════════════╗ ║ 📱 *ℚℝ ℂ𝕆𝔻𝔼 𝕄𝔸𝕂𝔼ℝ* 📱 ║ ╚══════════════════════════════════╝ 📝 *𝕌𝕤𝕒𝕘𝕖:* .qr [text/link] 📌 *𝔼𝕩𝕒𝕞𝕡𝕝𝕖:* .qr https://example |
| `.quiz` | PASS | 🧠 Quick quiz: Which planet is known as the Red Planet? A) Venus B) Mars C) Jupiter Answer: .quiz answer <choice> |
| `.quote` | PASS | ╔══════════════════════════════════╗ ║ 💫 *𝕄𝕆𝕋𝕀𝕍𝔸𝕋𝕀𝕆ℕ* 💫 ║ ╚══════════════════════════════════╝ _"The only person you are destined to become is the person you decide to b |
| `.random` | CONDITIONAL | ❌ .random could not complete: Offline command audit: external network disabled.; log: [Catalog] .random failed: Offline command audit: external network disabled. |
| `.rate` | PASS | ╔══════════════════════════════════╗ ║ ⭐ *ℝ𝔸𝕋𝔼 𝕄𝔼* ⭐ ║ ╚══════════════════════════════════╝ 🎯 *Target:* you 🏷️ *Title:* Absolute Legend 🏆 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
| `.rejoin` | PASS | ╔══════════════════════════════════╗ ║ 🔄 *ℝ𝔼𝕁𝕆𝕀ℕ 𝔾ℝ𝕆𝕌ℙ* 🔄 ║ ╚════════════════════╚════════════╝ *Usage:* !rejoin <group_id> *How to find ID:* Check the bot logs or use !gr |
| `.resetbalance` | PASS | 🚫 Owner-only command. |
| `.resetcoin` | PASS | 🚫 Owner-only command. |
| `.resetdi` | PASS | 🚫 Owner-only command. |
| `.resetwarn` | PASS | *Usage:* .resetwarn @user |
| `.restart` | PASS | 🚫 Owner-only command. |
| `.revoke` | PASS | ❌ Failed to revoke: sock.groupRevokeInvite is not a function |
| `.riddle` | PASS | ╔══════════════════════════════════╗ ║ 🧩 *ℝ𝕀𝔻𝔻𝕃𝔼 𝕋𝕀𝕄𝔼* 🧩 ║ ╚══════════════════════════════════╝ ❓ *What gets sharper the more you use it?* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
| `.rizzrate` | PASS | ✨ Rizz score for @[number redacted]: 58% (totally random). |
| `.roast` | PASS | ╔══════════════════════════════════╗ ║ 🔥 *ℝ𝕆𝔸𝕊𝕋𝔼𝔻* 🔥 ║ ╚══════════════════════════════════╝ You're the human version of a dead pixel 📺 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ _ |
| `.roastai` | PASS | Usage: .roastai <topic> |
| `.roastbattle` | PASS | 🎭 Keep it friendly: each participant may share one consensual, non-targeted joke. No slurs, threats, or harassment. |
| `.roastoftheday` | PASS | 🔥 Friendly roast of the day: my calendar needs a calendar to keep track of itself. |
| `.role` | PASS | 🎖️ Your role is Newcomer. Roles are cosmetic and have no real-world status. |
| `.roulette` | PASS | 🎮 This is a chat-only, no-stakes bot. Betting, wagering, and explosive/prank payloads are disabled. |
| `.rpg` | PASS | 🗺️ You reach a fork in a fictional trail. Choose: north (forest), east (river), or west (village). No purchases or real-world actions. |
| `.rpgbuy` | PASS | This roleplay build does not support trading or purchases between members. |
| `.rpginv` | PASS | 🎒 RPG inventory is empty. Use .rpg to begin a local, no-stakes story. |
| `.rpgshop` | PASS | 🛍️ RPG shop: this lightweight roleplay has no real-money or transferable items. |
| `.rps` | PASS | ╔══════════════════════════════════╗ ║ ✊ *ℝ𝕆ℂ𝕂 ℙ𝔸ℙ𝔼ℝ 𝕊ℂ𝕀𝕊𝕊𝕆ℝ𝕊* ✊ ║ ╚══════════════════════════════════╝ *Usage:* .rps <choice> 🪨 *.rps rock* 📄 *.rps paper* ✂️ *.rps sci |
| `.sand` | PASS | handler completed |
| `.savestatus` | PASS | 🚫 Status downloads are available only to the bot owner. |
| `.sellloot` | PASS | This roleplay build does not support trading or purchases between members. |
| `.setbio` | PASS | ╔══════════════════════════════════╗ ║ 📝 *𝕊𝔼𝕋 𝔹𝕀𝕆* 📝 ║ ╚══════════════════════════════════╝ 📝 *U𝕤𝕒𝕘𝕖:* .setbio [text] 📌 *𝔼𝕩𝕒𝕞𝕡𝕝𝕖:* .setbio Hello from MARCO MAL |
| `.setbotname` | PASS | 🚫 Owner-only command. |
| `.setbotpp` | PASS | 🚫 Owner-only command. |
| `.setdesc` | PASS | *Usage:* .setdesc <new description> |
| `.setgoodbye` | PASS | ╔══════════════════════════════════╗ ║ ✏️ *𝕊𝔼𝕋 𝔾𝕆𝕆𝔻𝔹𝕐𝔼* ✏️ ║ ╚══════════════════════════════════╝ *Usage:* .setgoodbye <your message> *Placeholders:* • @user - Member's n |
| `.setgroupname` | PASS | *Usage:* .setgroupname <new name> |
| `.setmenuimage` | PASS | 🚫 Owner-only command. |
| `.setname` | PASS | ╔══════════════════════════════════╗ ║ 👤 *𝕊𝔼𝕋 ℕ𝔸𝕄𝔼* 👤 ║ ╚══════════════════════════════════╝ 📝 *𝕌𝕤𝕒𝕘𝕖:* .setname [name] 📌 *𝔼𝕩𝕒𝕞𝕡𝕝𝕖:* .setname MARCO MALIK & WA |
| `.setnewsletter` | PASS | 🚫 Owner-only command. |
| `.setownername` | PASS | 🚫 Owner-only command. |
| `.setprefix` | PASS | 🚫 Owner-only command. |
| `.setstatusreply` | PASS | 🚫 Owner-only command. |
| `.settings` | PASS | ╔══════════════════════════════════╗ ║ ⚙️ *𝔹𝕆𝕋 𝕊𝔼𝕋𝕋𝕀ℕ𝔾𝕊* ⚙️ ║ ╚══════════════════════════════════╝ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 🔧 *ℂ𝕆ℕ𝔽𝕀𝔾𝕌ℝ𝔸𝕋𝕀𝕆ℕ* ━━━━━━━━ |
| `.setwelcome` | PASS | ╔══════════════════════════════════╗ ║ ✏️ *𝕊𝔼𝕋 𝕎𝔼𝕃ℂ𝕆𝕄𝔼* ✏️ ║ ╚══════════════════════════════════╝ *Usage:* .setwelcome <your message> *Placeholders:* • @user - Member's me |
| `.ship` | PASS | handler completed |
| `.shop` | PASS | 🛍️ Shop: 🎣 Fishing Rod — 50 coins; 🧭 Compass — 75 coins; 🧰 Tool Kit — 100 coins. Use .buy <item>. |
| `.simage` | PASS | Reply to an image with .simage. |
| `.simprate` | PASS | 💖 Friendship-energy score for @[number redacted]: 12%. |
| `.slap` | PASS | 🖐️ A gentle, imaginary high-five for @[number redacted]. |
| `.slots` | PASS | 🎰 🍋 🍋 🍇 (no real money or wagering). |
| `.snow` | PASS | handler completed |
| `.soulmate` | PASS | 💞 @[number redacted] gets a fictional soulmate badge today. |
| `.spam` | PASS | handler completed |
| `.sport` | PASS | ╔══════════════════════════════════╗ ║ ⚽ *MARCO MALIK & WAQAR WRITES 𝕊ℙ𝕆ℝ𝕋𝕊* ⚽ ║ ╚══════════════════════════════════╝ 📝 *𝕌𝕤𝕒𝕘𝕖:* .sport [team] 📌 *𝔼𝕩𝕒𝕞𝕡𝕝𝕖:* .sport |
| `.ssweb` | PASS | Usage: .ssweb https://example.com |
| `.status` | PASS | ╔══════════════════════════════════╗ ║ ❌ *𝔼ℝℝ𝕆ℝ* ❌ ║ ╚══════════════════════════════════╝ Could not fetch status information. Please try again later. |
| `.statusdl` | PASS | 🚫 Status downloads are available only to the bot owner. |
| `.statusdownload` | PASS | 🚫 Status downloads are available only to the bot owner. |
| `.statusreply` | PASS | 🚫 Owner-only command. |
| `.sticker` | PASS | ╔══════════════════════════════════╗ ║ 🖼️ *𝕊𝕋𝕀ℂ𝕂𝔼ℝ 𝕄𝔸𝕂𝔼ℝ* 🖼️ ║ ╚══════════════════════════════════╝ *How to use:* 1️⃣ Send an image/video with caption *.sticker* 2️⃣ Or  |
| `.stickerking` | PASS | 🏆 Sticker leaderboard needs message-history tracking, which is not enabled for privacy. |
| `.story` | PASS | 📖 A tiny lighthouse blinked through the fog each night. One evening, a lost boat answered with a warm golden light, and the sea grew quiet again. |
| `.sudo` | PASS | 🚫 Owner-only command. |
| `.suppress` | PASS | 🚫 Owner-only command. |
| `.tagall` | PASS | handler completed |
| `.take` | PASS | Reply to supported media/sticker with .take. |
| `.takepack` | PASS | Reply to supported media/sticker with .takepack. |
| `.thunder` | PASS | handler completed |
| `.tickle` | PASS | 🪶 A pretend feather tickle for @[number redacted] — stop if unwelcome. |
| `.tictactoe` | PASS | ❌⭕ Tic-tac-toe is currently single-message only. Challenge a friend and draw a 3×3 grid in chat. |
| `.tiktok` | PASS | 🎵 *TIKTOK DOWNLOADER* 📝 Usage: .tiktok <link> 📌 Example: .tiktok https://vt.tiktok.com/xxxx |
| `.topcoins` | PASS | 🏆 Top coins are not shown because the bot stores only your own local balance and does not publish a global leaderboard. |
| `.toxicrate` | PASS | 🌱 Kindness meter for @[number redacted]: 84% — take it lightly. |
| `.translate` | PASS | ╔══════════════════════════════════╗ ║ 🌐 *𝕋𝔼ℝ𝕏𝕌𝕏 𝕋ℝ𝔸ℕ𝕊𝕃𝔸𝕋𝕆ℝ* 🌐 ║ ╚══════════════════════════════════╝ 📝 *𝕌𝕤𝕒𝕘𝕖:* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ • *.translat |
| `.trivia` | PASS | ╔══════════════════════════════════╗ ║ 🧠 *𝕋ℝ𝕀𝕍𝕀𝔸 𝕋𝕀𝕄𝔼* 🧠 ║ ╚══════════════════════════════════╝ ❓ *Which organ pumps blood through the body?* ━━━━━━━━━━━━━━━━━━━━━━━━━━━ |
| `.truth` | PASS | ╔══════════════════════════════════╗ ║ 😇 *𝕋ℝ𝕌𝕋ℍ 𝕆ℝ 𝔻𝔸ℝ𝔼* 😇 ║ ║ ━━ *𝕋ℝ𝕌𝕋ℍ* ━━ ║ ╚══════════════════════════════════╝ 🎯 *𝕐𝕆𝕌ℝ ℚ𝕌𝔼𝕊𝕋𝕀𝕆ℕ:* ❓ Have you ever cried w |
| `.tts` | CONDITIONAL | Text-to-speech is not configured on this server. Add a trusted TTS provider before using this command. |
| `.twitter` | PASS | This source is not supported by the configured downloader. Use .instagram or .video with a public link; private or restricted posts cannot be fetched. |
| `.unblock` | PASS | ╔══════════════════════════════════╗ ║ ❓ *ℍ𝔼𝕃ℙ* ❓ ║ ╚══════════════════════════════════╝ 📝 *𝕌𝕤𝕒𝕘𝕖:* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ *.unblock [number redacted]* Please p |
| `.unmute` | PASS | ╔══════════════════════════════════╗ ║ 🔊 *𝔾ℝ𝕆𝕌ℙ 𝕌ℕ𝕄𝕌𝕋𝔼𝔻* 🔊 ║ ╚══════════════════════════════════╝ Everyone can now send messages. |
| `.update` | PASS | 🚫 Owner-only command. |
| `.video` | PASS | 📹 *VIDEO DOWNLOADER* 📝 Usage: .video <name or any video link> 📌 Example: .video funny cats 📌 Works with YouTube, TikTok, Instagram, Facebook links 💠 *Powered by MARCO MALIK X* |
| `.viewonce` | PASS | 👁️ *View Once Recovery* Reply to your own View Once photo, video, or voice note with .vv. For privacy, this command cannot reveal anyone else's View Once media. |
| `.virus` | PASS | handler completed |
| `.vs` | PASS | ⚔️ @[number redacted] vs. the group: friendly match, no real stakes! |
| `.vv` | PASS | 👁️ *View Once Recovery* Reply to your own View Once photo, video, or voice note with .vv. For privacy, this command cannot reveal anyone else's View Once media. |
| `.vv2` | PASS | Reply to your own View Once media with .vv. The bot will not recover another person's View Once content. |
| `.waifu` | CONDITIONAL | ❌ *Failed to fetch waifu* 💡 _Try again or use a specific category._ *Available:* waifu, neko, shinobu, hug, pat, smile; log: ❌ Waifu error: Offline command audit: external network |
| `.wallpaper` | CONDITIONAL | ❌ *Failed to fetch wallpaper* _Error: Offline command audit: external network disabled._ 💡 _Try a different category or try again._ *Example:* .wallpaper sunset; log: ❌ Wallpaper  |
| `.wanted` | PASS | 📜 WANTED: @[number redacted] — for stealing all the snacks. (Fictional fun only.) |
| `.warn` | PASS | ╔══════════════════════════════════╗ ║ ⚠️ *𝕎𝔸ℝℕ 𝕌𝕊𝔼ℝ* ⚠️ ║ ╚══════════════════════════════════╝ *Usage:* .warn @user *Alt:* Reply to a message with .warn 3 warnings = automati |
| `.wave` | PASS | 👋 @[number redacted], sending a friendly wave! |
| `.wd` | PASS | Usage: .wd <amount> (1–1,000,000) |
| `.weather` | PASS | ╔══════════════════════════════════╗ ║ 🌤️ *MARCO MALIK & WAQAR WRITES 𝕎𝔼𝔸𝕋ℍ𝔼ℝ* 🌤️ ║ ╚══════════════════════════════════╝ 📝 *𝕌𝕤𝕒𝕘𝕖:* .weather [city] 📌 *𝔼𝕩𝕒𝕞𝕡𝕝𝕖: |
| `.weekly` | PASS | ✅ Weekly complete: +500 coins and +10 XP. Balance: 581. |
| `.weeklymvp` | PASS | 🌟 Weekly MVP is not calculated because the bot does not archive chat activity. |
| `.welcome` | PASS | ╔══════════════════════════════════╗ ║ 👋 *𝕎𝔼𝕃ℂ𝕆𝕄𝔼 𝕊𝕐𝕊𝕋𝔼𝕄* 👋 ║ ╚══════════════════════════════════╝ *Status:* ❌ Disabled *Current message:* ╔══════════════════════════ |
| `.wiki` | PASS | ╔══════════════════════════════════╗ ║ 📚 *𝕎𝕀𝕂𝕀ℙ𝔼𝔻𝕀𝔸* 📚 ║ ╚══════════════════════════════════╝ *Usage:* .wiki <topic> *Example:* .wiki Elon Musk |
| `.work` | PASS | ⏳ You can use .work again after the cooldown. |
| `.wyr` | PASS | 🤔 Would you rather: always be early or always have snacks? |
| `.yeet` | PASS | 🚀 @[number redacted] is gently yeeted into a pile of pillows (cartoon only). |
| `.ytvideo` | PASS | 📹 *VIDEO DOWNLOADER* 📝 Usage: .video <name or any video link> 📌 Example: .video funny cats 📌 Works with YouTube, TikTok, Instagram, Facebook links 💠 *Powered by MARCO MALIK X* |
| `.zodiac` | PASS | ╔══════════════════════════════════╗ ║ 🔮 *ℤ𝕆𝔻𝕀𝔸ℂ ℍ𝕆ℝ𝕆𝕊ℂ𝕆ℙ𝔼* 🔮 ║ ╚══════════════════════════════════╝ *Usage:* .zodiac <sign> ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ♈ *Aries* |
| `.zoom` | CONDITIONAL | Zoom meeting creation is not configured; use your organization's official Zoom account to create meetings. |

## Shortcut aliases

| Alias | Dispatch target | Target registered |
|---|---|---|
| `.alive` | `.ping` | PASS |
| `.allmenu` | `.help` | PASS |
| `.apkdl` | `.apk` | PASS |
| `.app` | `.apk` | PASS |
| `.ask` | `.ai` | PASS |
| `.audio` | `.play` | PASS |
| `.bot_ai` | `.ai` | PASS |
| `.chatgpt` | `.ai` | PASS |
| `.cmds` | `.help` | PASS |
| `.commands` | `.help` | PASS |
| `.connect` | `.pair` | PASS |
| `.dev` | `.creator` | PASS |
| `.developer` | `.creator` | PASS |
| `.fb` | `.facebook` | PASS |
| `.fbdl` | `.facebook` | PASS |
| `.film` | `.movie` | PASS |
| `.gpt` | `.ai` | PASS |
| `.h` | `.help` | PASS |
| `.ig` | `.instagram` | PASS |
| `.insta` | `.instagram` | PASS |
| `.list` | `.help` | PASS |
| `.menu` | `.help` | PASS |
| `.mp3` | `.play` | PASS |
| `.mp4` | `.video` | PASS |
| `.music` | `.play` | PASS |
| `.mut` | `.muth` | PASS |
| `.mutth` | `.muth` | PASS |
| `.naat` | `.play` | PASS |
| `.owners` | `.owner` | PASS |
| `.pairing` | `.pair` | PASS |
| `.reel` | `.instagram` | PASS |
| `.runtime` | `.botstats` | PASS |
| `.song` | `.play` | PASS |
| `.tiktokdl` | `.tiktok` | PASS |
| `.tt` | `.tiktok` | PASS |
| `.up` | `.botstats` | PASS |
| `.uptime` | `.botstats` | PASS |
| `.yt` | `.video` | PASS |
| `.ytmp3` | `.play` | PASS |
| `.ytmp4` | `.video` | PASS |
