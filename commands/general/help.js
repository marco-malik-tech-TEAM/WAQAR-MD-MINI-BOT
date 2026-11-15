import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { BRAND, getPairUrl } from "../../brand.js";
import { CHANNEL_LINK } from "../../services/channelService.js";
import { getCachedConfig } from "../../services/configService.js";
import { catalogCategories } from "../catalog/index.js";

const CATEGORY_ICON = { General: "🧭", AI: "🤖", Admin: "🛡️", Owner: "👑", Media: "🎞️", Fun: "🎭", Games: "🎮", Economy: "💰", Anime: "👾", Textmaker: "🖋️" };
const COMMAND_ICON = {
  attp: "🖼️", bratgpt: "🟩", crop: "✂️", getpp: "👤", groupstats: "📊", myactivity: "🔒", simage: "🖼️", ssweb: "🌐", takepack: "📦", take: "🎭", tts: "🗣️", vv2: "👁️", zoom: "🎥", imagine: "🎨",
  antibadword: "🤐", antibot: "🤖", antigroupmention: "🚫", antigroupstatus: "🛡️", antispam: "⛔", antisticker: "🚫", antitag: "🏷️", autosticker: "🎭", clean: "🧹", delete: "🗑️", pending: "⌛",
  afk: "🌙", broadcast: "📢", mode: "⚙️", newsletter: "📰", savestatus: "💾", setbotname: "🏷️", setownername: "👑", setbotpp: "🖼️", setmenuimage: "🖼️", setprefix: "✏️", statusreply: "💬", setstatusreply: "📝",
  igs: "📸", igsc: "📸", igsf: "📸", instagram: "📸", pinterest: "📌", twitter: "𝕏", ytvideo: "▶️", facebook: "📘", tiktok: "🎵",
  memegen: "😂", memesearch: "🔎", gayrate: "📊", iqrate: "🧠", rizzrate: "✨", simprate: "💖", toxicrate: "🌱", howgay: "🏳️‍🌈", howdumb: "🧠", insult: "😄", compliment: "🌟", jail: "🔒", wanted: "📜", pies: "🥧", soulmate: "💞", marry: "💍", divorce: "📄", babyname: "👶", fortune: "🔮", horoscope: "✨", mood: "🌤️", profession: "🧭", character: "🎭", choose: "🎯", slap: "🖐️", kiss: "💋", hug: "🤗", pat: "🫳", cuddle: "🧸", poke: "👉", bite: "🧛", bonk: "🪄", punch: "🥊", yeet: "🚀", highfive: "🙌", handhold: "🤝", tickle: "🪶", feed: "🍪", wave: "👋", story: "📖", debate: "🗣️", caption: "📝",
  bomb: "💣", bet: "🎲", horse: "🐎", slots: "🎰", tictactoe: "❌", fish: "🎣", hunt: "🏹", chop: "🪓", forage: "🌿", rpg: "🗺️", daily: "📅", weekly: "🗓️", work: "🧰", crime: "🕵️", mine: "⛏️", balance: "💰", shop: "🛍️", buy: "🛒", levelup: "⭐", role: "🎖️", resetbalance: "🔄", resetcoin: "🔄", resetdi: "🔄", konachan: "🌸", neko: "🐱", random: "🎲"
};

function commandIcon(name, category) {
  if (COMMAND_ICON[name]) return COMMAND_ICON[name];
  if (category === "Admin") return "🛡️";
  if (category === "Owner") return "👑";
  if (category === "Games") return "🎮";
  if (category === "Economy") return "💰";
  if (category === "Media") return "🎞️";
  if (category === "Textmaker") return "✨";
  if (category === "Anime") return "🌸";
  if (category === "AI") return "🤖";
  return "🔹";
}

export function formatCatalogCategory(category, names, prefix, part = 1, totalParts = 1) {
  const title = `${category.toUpperCase()} COMMANDS${totalParts > 1 ? ` · ${part}/${totalParts}` : ""}`;
  const rows = names.map(name => `│ ${commandIcon(name, category)} ➜ *${prefix}${name}*`).join("\n");
  return `╭━━『 ${CATEGORY_ICON[category] || "📦"} *${title}* 』━━╮\n${rows}\n╰━━━━━━━━━━━━━━━━━━╯`;
}

export const help = async (sock, m, args) => {
  const config = getCachedConfig();
  const p = config.prefix || "!";
  const displayName = config.menuTitle || BRAND.name;
  const ownerDisplayName = config.menuOwnerName || "Marco Malik";

  // Load Logo securely
  let logoBuffer = null;
  try {
    const logoPath = join(process.cwd(), "assets", "menu.jpeg");
    if (existsSync(logoPath)) {
      logoBuffer = readFileSync(logoPath);
    }
  } catch (e) {
    console.error("❌ Failed to load logo for help command:", e.message);
  }


  const now = new Date();
  const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getFullYear()).slice(-2)}`;

  const caption = `╭───『 🤖 *${displayName} ${BRAND.version}* 』───╮
│
│ ✨ *Prefix:* ${p}  _(also . ! or no prefix for help)_
│ 📅 *Date:* ${formattedDate}
│ 👑 *Owner:* ${ownerDisplayName}
│ 🌐 *Website:* ${BRAND.website}
╰──────────────────────────────╯

╭───『 🎮 *𝔽𝕌ℕ ℤ𝕆ℕ𝔼* 』───╮
│ 💘 ➾ *${p}ship* @user1 @user2
│ ✨ ➾ *${p}fancy* <text>
│ 😂 ➾ *${p}joke*
│ 🧠 ➾ *${p}fact*
│ 😇 ➾ *${p}truth*
│ 😈 ➾ *${p}dare*
│ 🎱 ➾ *${p}8ball* <question>
│ 💘 ➾ *${p}pickup*
│ 🌟 ➾ *${p}compliment*
│ 🔥 ➾ *${p}roast*
│ 🧩 ➾ *${p}riddle*
│ 💻 ➾ *${p}hack* <@user>
│ ☕ ➾ *${p}chai* <@user>
│ ✊ ➾ *${p}muth* _(funny, targets only you)_
╰──────────────────────────────╯

╭───『 💕 *𝕃𝕆𝕍𝔼 & ℝ𝔼𝕃𝔸𝕋𝕀𝕆ℕ𝕊* 』───╮
│ 💘 ➾ *${p}flirt*
│ 💌 ➾ *${p}lovemsg*
│ 💌 ➾ *${p}loveletter* <name>
│ 🎯 ➾ *${p}crush* <stage>
│ 🌅 ➾ *${p}goodmorning* <name>
│ 🌙 ➾ *${p}goodnight* <name>
│ 💞 ➾ *${p}compatibility* A & B
│ 💑 ➾ *${p}dateidea* <type>
╰──────────────────────────────╯

╭───『 🎭 *ℙℝ𝔸ℕ𝕂𝕊 & 𝕋ℝ𝕆𝕃𝕃* 』───╮
│ ☣️ ➾ *${p}virus*
│ 💀 ➾ *${p}crash*
│ 🟢 ➾ *${p}matrix*
│ 🕵️ ➾ *${p}detective* <@user>
│ 💣 ➾ *${p}spam*
│ 🤫 ➾ *${p}confess* <text>
│ ⭐ ➾ *${p}rate* <@user>
╰──────────────────────────────╯

╭───『 🎲 *𝔾𝔸𝕄𝔼𝕊* 』───╮
│ ✊ ➾ *${p}rps* <choice>
│ 🪙 ➾ *${p}coinflip*
│ 🎲 ➾ *${p}dice* <count>
│ 🧠 ➾ *${p}trivia*
╰──────────────────────────────╯

╭───『 ⚙️ *𝔾𝔼ℕ𝔼ℝ𝔸𝕃* 』───╮
│ 🏓 ➾ *${p}ping*
│ 📊 ➾ *${p}botstats*
│ 👑 ➾ *${p}owner*
│ 🚫 ➾ *${p}block* <@user>
│ ✅ ➾ *${p}unblock* <number>
│ ℹ️ ➾ *${p}help* / *menu*
│ 🔗 ➾ *${p}pair* <number> _(link your own WhatsApp)_
│ 💾 ➾ React to any status → auto-saved to your chat
│ 💎 ➾ *${p}creator*
│ 💫 ➾ *${p}quote*
╰──────────────────────────────╯

╭───『 🎬 *𝕄𝔼𝔻𝕀𝔸* 』───╮
│ 🎵 ➾ *${p}play* <song name / link> _(MP3)_
│ 📹 ➾ *${p}video* <name / any link>
│ 🎬 ➾ *${p}movie* <movie name> _(info + trailer)_
│ 🎵 ➾ *${p}tiktok* <link>
│ 📸 ➾ *${p}instagram* <link>
│ 📦 ➾ *${p}apk* <app name>
│ 📘 ➾ *${p}facebook* <link>
│ ⚽ ➾ *${p}sport* <team name>
│ 📰 ➾ *${p}news*
│ 😂 ➾ *${p}meme*
│ 🎤 ➾ *${p}lyrics* <song>
│ 🔮 ➾ *${p}zodiac* <sign>
│ 🖼️ ➾ *${p}wallpaper* <theme>
│ 🌸 ➾ *${p}waifu* <category>
╰──────────────────────────────╯

╭───『 👤 *𝕊𝕋𝔸𝕋𝕌𝕊* 』───╮
│ 🕵️ ➾ *${p}status* <@user/num>
│ 💾 ➾ Reply to a viewed status: *${p}savestatus* / *${p}statusdl*
│ 📝 ➾ *${p}setbio* <text>
│ ✏️ ➾ *${p}setname* <name>
╰──────────────────────────────╯

╭───『 🛠️ *𝕋𝕆𝕆𝕃𝕊* 』───╮
│ 🔢 ➾ *${p}calc* <expression>
│ 📱 ➾ *${p}qr* <text>
│ 🌐 ➾ *${p}translate* <text>
│ 🌤️ ➾ *${p}weather* <city>
│ 📖 ➾ *${p}define* <word>
│ ✨ ➾ *${p}aesthetic* <text>
│ 🖼️ ➾ *${p}sticker*
│ 🐙 ➾ *${p}github* <user>
│ 🔐 ➾ *${p}password* <length>
│ 📚 ➾ *${p}wiki* <topic>
│ 🔣 ➾ *${p}base64* encode/decode
│ 🌐 ➾ *${p}ip* <address>
│ 👁️ ➾ *${p}vv* _(only your own View Once media)_
│ 🤖 ➾ *${p}ai* <question>
│ 💬 ➾ *${p}chatbot* on/off/status _(owner; auto-replies in DMs and groups)_
╰──────────────────────────────╯

╭───『 ⚙️ *𝕊𝔼𝕋𝕋𝕀ℕ𝔾𝕊* 』───╮
│ 🔧 ➾ *${p}settings*
│ ✏️ ➾ *${p}prefix* <new>
│ 🌐 ➾ *${p}alwaysonline*
│ ❤️ ➾ *${p}autolikestatus*
│ 👀 ➾ *${p}autoviewstatus*
│ 🛡️ ➾ *${p}antidelete* _(DMs only)_
│ 📵 ➾ *${p}anticall*
│ ✔️ ➾ *${p}autoread*
│ 🏷️ ➾ *${p}setbotname* / *${p}setownername*
│ 🖼️ ➾ Send/reply image with *${p}setmenuimage*
│ 💬 ➾ *${p}statusreply* on/off/status; *${p}setstatusreply* <text>
╰──────────────────────────────╯

╭───『 👥 *𝔾ℝ𝕆𝕌ℙ 𝕄𝔸ℕ𝔸𝔾𝔼𝕄𝔼ℕ𝕋* 』───╮
│ 📢 ➾ *${p}hidetag* <msg>
│ 🏷️ ➾ *${p}tagall* <msg>
│ 👑 ➾ *${p}admins*
│ 📊 ➾ *${p}groupinfo*
│ 🔗 ➾ *${p}grouplink* / *${p}revoke*
│ ➕ ➾ *${p}add* / *${p}kick*
│ ⬆️ ➾ *${p}promote* / *${p}demote*
│ 🔇 ➾ *${p}mute* / *${p}unmute*
│ ✏️ ➾ *${p}setgroupname* / *${p}setdesc*
╰──────────────────────────────╯

╭───『 🎉 *𝔾ℝ𝕆𝕌ℙ 𝔸𝕌𝕋𝕆𝕄𝔸𝕋𝕀𝕆ℕ* 』───╮
│ 👋 ➾ *${p}welcome* on/off
│ ✏️ ➾ *${p}setwelcome* <msg>
│ 🚪 ➾ *${p}goodbye* on/off
│ ✏️ ➾ *${p}setgoodbye* <msg>
│ 🔗 ➾ *${p}antilink* on/kick/off
│ 🛡️ ➾ *${p}groupantidelete* on/off
│ 📊 ➾ *${p}poll* Q | A | B
│ ⚠️ ➾ *${p}warn* / *${p}resetwarn*
│ 👋 ➾ *${p}leave* / *${p}rejoin*
│ 🤖 ➾ *${p}bot* on/off
╰──────────────────────────────╯

`;

  const additionalCount = Object.values(catalogCategories).reduce((total, names) => total + names.length, 0);
  const footer = `\n\n📦 *${additionalCount} additional commands*\n🤖 *Pair your own bot:* ${getPairUrl()}\n📢 *Channel:* ${CHANNEL_LINK}\n\n💠 *Powered by ${displayName}*`;
  if (logoBuffer) {
    await sock.sendMessage(m.key.remoteJid, { image: logoBuffer, caption: `🤖 *${displayName} ${BRAND.version}*`, linkPreview: null }, { quoted: m });
  }
  await sock.sendMessage(m.key.remoteJid, { text: caption + footer }, { quoted: m });
  for (const [category, names] of Object.entries(catalogCategories)) {
    const chunkSize = 28;
    const totalParts = Math.ceil(names.length / chunkSize);
    for (let offset = 0; offset < names.length; offset += chunkSize) {
      const part = Math.floor(offset / chunkSize) + 1;
      const chunk = names.slice(offset, offset + chunkSize);
      await sock.sendMessage(m.key.remoteJid, { text: formatCatalogCategory(category, chunk, p, part, totalParts) }, { quoted: m });
    }
  }
  return null;
};
