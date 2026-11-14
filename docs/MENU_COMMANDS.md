# Additional Menu Command Catalog

This catalog lists the 164 separately registered commands added from the user-provided 220-entry menu. The source message claimed 552 total commands, but the attached text contained only 220 command entries; this document therefore covers only the commands actually present in that attachment.

Each command has its own module under `commands/catalog/`; shared runtime behavior is in `services/catalogCommands.js`. Use `.menu` or `.help` to see the expanded live menu.

## General

- `.attp`
- `.bratgpt`
- `.crop`
- `.getpp`
- `.groupstats`
- `.myactivity`
- `.simage`
- `.ssweb`
- `.takepack`
- `.take`
- `.tts`
- `.vv2`
- `.zoom`

## Ai

- `.imagine`

## Admin

- `.antibadword`
- `.antibot`
- `.antigroupmention`
- `.antigroupstatus`
- `.antispam`
- `.antisticker`
- `.antitag`
- `.autosticker`
- `.clean`
- `.delete`
- `.delgcstatus`
- `.groupstatus`
- `.pending`

## Owner

- `.afk`
- `.autoreact`
- `.autostatus`
- `.broadcast`
- `.mode`
- `.newsletter`
- `.pmblocker`
- `.restart`
- `.savestatus`
- `.setbotname`
- `.setbotpp`
- `.setmenuimage`
- `.setnewsletter`
- `.setprefix`
- `.sudo`
- `.suppress`
- `.update`

## Media

- `.igs`
- `.igsc`
- `.igsf`
- `.pinterest`
- `.twitter`
- `.ytvideo`

## Fun

- `.gayrate`
- `.insult`
- `.jail`
- `.memegen`
- `.memesearch`
- `.pies`
- `.wanted`
- `.iqrate`
- `.rizzrate`
- `.simprate`
- `.toxicrate`
- `.howgay`
- `.howdumb`
- `.bestie`
- `.soulmate`
- `.enemy`
- `.marry`
- `.divorce`
- `.vs`
- `.babyname`
- `.fortune`
- `.horoscope`
- `.mood`
- `.profession`
- `.character`
- `.choose`
- `.slap`
- `.kiss`
- `.hug`
- `.pat`
- `.cuddle`
- `.poke`
- `.bite`
- `.bonk`
- `.punch`
- `.yeet`
- `.highfive`
- `.handhold`
- `.tickle`
- `.feed`
- `.wave`
- `.mostactive`
- `.mostquiet`
- `.nightowl`
- `.mentionking`
- `.stickerking`
- `.weeklymvp`
- `.roastoftheday`
- `.guessnumber`
- `.hangman`
- `.quiz`
- `.roulette`
- `.wyr`
- `.nhie`
- `.hotseat`
- `.roastbattle`
- `.roastai`
- `.story`
- `.debate`
- `.pick`
- `.caption`

## Games

- `.bomb`
- `.bet`
- `.horse`
- `.slots`
- `.tictactoe`
- `.fish`
- `.hunt`
- `.chop`
- `.forage`
- `.rpg`
- `.rpginv`
- `.rpgshop`
- `.rpgbuy`
- `.sellloot`

## Economy

- `.daily`
- `.weekly`
- `.work`
- `.crime`
- `.mine`
- `.balance`
- `.dep`
- `.wd`
- `.pay`
- `.shop`
- `.buy`
- `.levelup`
- `.role`
- `.autolevelup`
- `.topcoins`
- `.resetbalance`
- `.resetcoin`
- `.resetdi`
- `.economy`

## Anime

- `.konachan`
- `.neko`
- `.random`

## Textmaker

- `.1917`
- `.arena`
- `.blackpink`
- `.devil`
- `.fire`
- `.glitch`
- `.hacker`
- `.ice`
- `.impressive`
- `.leaves`
- `.light`
- `.metallic`
- `.neon`
- `.purple`
- `.sand`
- `.snow`
- `.thunder`

## Safety and integration notes

- New group moderation switches require a group admin. Owner controls are restricted to the configured bot owner.
- `.antibadword words word1,word2` configures the group word list; anti-spam, anti-sticker, anti-tag, and mass-mention filters apply only when enabled by an admin.
- Activity rankings do not archive message history. The bot intentionally avoids private chat-history tracking.
- `.broadcast`, remote restart/update, account security changes, Zoom integration, image generation, and TTS are not enabled by this build; these commands state their limitation rather than silently claiming success.
- Economy balances are local game-only data in `data/menu-economy.json`; they are not money or transferable value. Attach a Railway volume at `/app/data` if these scores must survive redeploys.
- `.pinterest` and `.twitter` are registered but the configured downloader has no supported extractor for them. Existing YouTube/TikTok/Instagram routes remain subject to upstream access and provider availability.
- View Once content is not recoverable through `.take`, `.takepack`, `.crop`, or `.simage`; only `.vv` may be used for the sender's own View Once message.
