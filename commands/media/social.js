import { getCachedConfig } from "../../services/configService.js";
import { downloadMedia, firstUrl, tiktokDownload } from "../../utils/downloader.js";
import { BRAND } from "../../brand.js";

const make = (site, label, emoji, example) => async (sock, m, args) => {
    const p = getCachedConfig().prefix || "!";
    const jid = m.key.remoteJid;
    // link can come from args or from a replied/quoted message
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const qText = quoted?.conversation || quoted?.extendedTextMessage?.text || "";
    const url = firstUrl(args.join(" ")) || firstUrl(qText);
    if (!url) return `${emoji} *${label} DOWNLOADER*\n\n📝 Usage: ${p}${site} <link>\n📌 Example: ${p}${site} ${example}\n\n${BRAND.footer}`;

    await sock.sendMessage(jid, { text: `${emoji} Downloading ${label} video... ⏳` }, { quoted: m });
    try {
        const { buffer } = await downloadMedia(url, { site, kind: "video" });
        await sock.sendMessage(jid, { video: buffer, mimetype: "video/mp4", caption: `${emoji} *${label} Video* ✅\n\n${BRAND.footer}` }, { quoted: m });
    } catch (e) {
        console.error(`${label} download failed:`, e.message, e.details);
        return `❌ *${label} download failed.*\n\n💡 Link private/removed, or servers are busy. Try again later.`;
    }
};

const fmt = (n) => (n === undefined || n === null ? "-" : Number(n).toLocaleString("en-US"));

export const tiktok = async (sock, m, args) => {
    const p = getCachedConfig().prefix || ".";
    const jid = m.key.remoteJid;
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const qText = quoted?.conversation || quoted?.extendedTextMessage?.text || "";
    const url = firstUrl(args.join(" ")) || firstUrl(qText);
    if (!url) return `🎵 *TIKTOK DOWNLOADER*\n\n📝 Usage: ${p}tiktok <link>\n📌 Example: ${p}tiktok https://vt.tiktok.com/xxxx`;

    await sock.sendMessage(jid, { text: "🔍 *Searching TikTok video...* ⏳" }, { quoted: m });
    try {
        const { buffer, info } = await tiktokDownload(url);
        const when = info.date ? info.date.toISOString().replace("T", " ").slice(0, 16) + " UTC" : "-";
        const details = `🎵 *TIKTOK VIDEO DETAILS*\n\n📝 *Title:* ${(info.title || "-").slice(0, 150)}\n👤 *Username:* @${info.username || "-"}\n🆔 *User ID:* ${info.id || "-"}\n📛 *Name:* ${info.author || "-"}\n👀 *Views:* ${fmt(info.views)}\n❤️ *Likes:* ${fmt(info.likes)}\n💬 *Comments:* ${fmt(info.comments)}\n🔁 *Shares:* ${fmt(info.shares)}\n🕒 *Posted:* ${when}\n⏱️ *Duration:* ${info.duration || "-"}s\n\n_Sending video..._ ⏳`;
        await sock.sendMessage(jid, { text: details }, { quoted: m });
        await sock.sendMessage(jid, { video: buffer, mimetype: "video/mp4", caption: `🎵 *TikTok Video* ✅\n\n💠 *Powered by ${BRAND.name}*` }, { quoted: m });
    } catch (e) {
        console.error("TikTok failed:", e.message, e.details);
        return `❌ *TikTok download failed.*\n\n💡 Link private/removed or servers busy. Try again in a minute.`;
    }
};
export const instagram = make("instagram", "Instagram", "📸", "https://www.instagram.com/reel/xxxx");
export const facebook = make("facebook", "Facebook", "📘", "https://www.facebook.com/watch?v=xxxx");
