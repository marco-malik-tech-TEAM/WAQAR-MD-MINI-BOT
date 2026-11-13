import yts from "yt-search";
import axios from "axios";
import { getCachedConfig } from "../../services/configService.js";
import { downloadMedia, firstUrl, detectSite } from "../../utils/downloader.js";
import { BRAND } from "../../brand.js";

export const video = async (sock, m, args) => {
    const p = getCachedConfig().prefix || "!";
    const jid = m.key.remoteJid;
    const query = args.join(" ").trim();
    if (!query) return `📹 *VIDEO LINK / PUBLIC TELEGRAM VIDEO*\n\n📝 Usage: ${p}video <YouTube link, public Telegram post link, or title>\n📌 Telegram example: ${p}video https://t.me/channel_name/123\n\nYouTube videos are opened from their official page. Only publicly accessible Telegram post videos can be attached here.\n\n${BRAND.footer}`;

    try {
        const link = firstUrl(query);
        const site = link ? detectSite(link) : "youtube";
        if (site === "youtube") {
            let v;
            if (link) {
                const id = (link.match(/(?:v=|youtu\.be\/|shorts\/)([\w-]{11})/) || [])[1];
                v = id ? await yts({ videoId: id }) : null;
                if (v) v.url = link;
            }
            if (!v) v = (await yts(query)).videos?.[0];
            if (!v) return `❌ Video not found. Try a different title.`;
            const text = `📹 *VIDEO FOUND*\n\n📌 *Title:* ${v.title}\n⏱️ *Duration:* ${v.timestamp || v.duration?.timestamp || "-"}\n🔗 *Official YouTube link:* ${v.url}\n\nYouTube file downloads are not available here. Open the original link to watch it.\n\n${BRAND.footer}`;
            let thumb;
            try { thumb = Buffer.from((await axios.get(v.thumbnail || v.image, { responseType: "arraybuffer", timeout: 8000 })).data); } catch { }
            await sock.sendMessage(jid, thumb ? { image: thumb, caption: text } : { text }, { quoted: m });
            return;
        }

        if (site !== "telegram") {
            return `❌ This command currently accepts YouTube links for official viewing or public Telegram channel-post video links for attachments.\n\n${BRAND.footer}`;
        }

        await sock.sendMessage(jid, { text: `📹 Downloading the publicly accessible Telegram post video... ⏳` }, { quoted: m });
        try {
            const { buffer } = await downloadMedia(link, { site: "telegram", kind: "video" });
            await sock.sendMessage(jid, { video: buffer, caption: `🎬 Telegram video\n\n${BRAND.footer}`, mimetype: "video/mp4" }, { quoted: m });
        } catch (e) {
            console.error("Telegram video download failed:", e.message, e.details);
            await sock.sendMessage(jid, { text: `❌ Telegram video download failed. Check that the post is public, the link is a channel post such as https://t.me/channel_name/123, and the file is under 95 MB. Private or restricted posts are not supported.` }, { quoted: m });
        }
    } catch (err) {
        console.error("Video command error:", err.message);
        return `❌ Failed to process this video request.`;
    }
};
