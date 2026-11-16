import yts from "yt-search";
import axios from "axios";
import { getCachedConfig } from "../../services/configService.js";
import { downloadMedia, downloadFailureHint, firstUrl, detectSite, buildYouTubeTarget } from "../../utils/downloader.js";
import { BRAND } from "../../brand.js";

export const video = async (sock, m, args) => {
    const p = getCachedConfig().prefix || "!";
    const jid = m.key.remoteJid;
    const query = args.join(" ").trim();
    if (!query) return `📹 *VIDEO DOWNLOADER*\n\n📝 Usage: ${p}video <name or any video link>\n📌 Example: ${p}video funny cats\n📌 Works with YouTube, TikTok, Instagram, Facebook links\n\n${BRAND.footer}`;

    try {
        const link = firstUrl(query);
        const site = link ? detectSite(link) : "youtube";
        let url = link;
        let title = "Video";
        if (!link || site === "youtube") {
            if (link) {
                // Avoid a metadata dependency for a supplied URL; download it directly.
                title = "YouTube video";
                await sock.sendMessage(jid, { text: "📹 Downloading from the supplied YouTube link... ⏳" }, { quoted: m });
            } else {
                let v;
                try { v = (await yts(query)).videos?.[0]; } catch { /* Try yt-dlp's built-in search next. */ }
                if (v) {
                    url = v.url;
                    title = v.title || query;
                    const info = `📹 *VIDEO DOWNLOAD*\n\n📌 *Title:* ${title}\n⏱️ *Duration:* ${v.timestamp || v.duration?.timestamp || "-"}\n👀 *Views:* ${v.views || "-"}\n🔗 *Link:* ${url}\n\n_Downloading video... please wait_ ⏳`;
                    let thumb;
                    try { if (v.thumbnail || v.image) thumb = Buffer.from((await axios.get(v.thumbnail || v.image, { responseType: "arraybuffer", timeout: 8000 })).data); } catch { }
                    await sock.sendMessage(jid, thumb ? { image: thumb, caption: info } : { text: info }, { quoted: m });
                } else {
                    url = buildYouTubeTarget(query, null);
                    title = query;
                    await sock.sendMessage(jid, { text: "📹 Metadata search is unavailable; trying yt-dlp's built-in YouTube search... ⏳" }, { quoted: m });
                }
            }
        } else {
            await sock.sendMessage(jid, { text: `📹 Downloading from *${site}*... ⏳` }, { quoted: m });
        }

        try {
            const { buffer } = await downloadMedia(url, { site, kind: "video" });
            await sock.sendMessage(jid, { video: buffer, caption: `🎬 ${title}\n\n${BRAND.footer}`, mimetype: "video/mp4" }, { quoted: m });
        } catch (e) {
            console.error("Video download failed:", e.message, e.details);
            const visibleUrl = String(url).startsWith("ytsearch1:") ? "YouTube search fallback" : url;
            await sock.sendMessage(jid, { text: `❌ *Video download failed.*\n\n💡 ${downloadFailureHint(e)}\n🔗 ${visibleUrl}` }, { quoted: m });
        }
    } catch (err) {
        console.error("Video error:", err.message);
        return `❌ Failed to process video request.`;
    }
};
