import yts from "yt-search";
import axios from "axios";
import { getCachedConfig } from "../../services/configService.js";
import { firstUrl } from "../../utils/downloader.js";
import { BRAND } from "../../brand.js";

export const play = async (sock, m, args) => {
    const p = getCachedConfig().prefix || "!";
    const jid = m.key.remoteJid;
    const query = args.join(" ").trim();
    if (!query) return `🎵 *MUSIC SEARCH*\n\n📝 Usage: ${p}play <song name or YouTube link>\n📌 Example: ${p}play Light Jesus\n\nThis command shares the official listening link; it does not extract MP3 files from YouTube.\n\n${BRAND.footer}`;

    try {
        const link = firstUrl(query);
        let video;
        if (link && /(?:youtube\.com|youtu\.be)/i.test(link)) {
            const id = (link.match(/(?:v=|youtu\.be\/|shorts\/)([\w-]{11})/) || [])[1];
            video = id ? await yts({ videoId: id }) : null;
            if (video) video.url = link;
        }
        if (!video) video = (await yts(query)).videos?.[0];
        if (!video) return `❌ Song not found. Try a different name.`;

        const info = `🎵 *MUSIC FOUND*\n\n📌 *Title:* ${video.title}\n⏱️ *Duration:* ${video.timestamp || video.duration?.timestamp || "-"}\n🔗 *Official YouTube link:* ${video.url}\n\nOpen the original link to listen. MP3 extraction is not provided.\n\n${BRAND.footer}`;
        let thumb;
        try { thumb = Buffer.from((await axios.get(video.thumbnail || video.image, { responseType: "arraybuffer", timeout: 8000 })).data); } catch { }
        await sock.sendMessage(jid, thumb ? { image: thumb, caption: info } : { text: info }, { quoted: m });
    } catch (err) {
        console.error("Play search error:", err.message);
        return `❌ Failed to search for this song right now.`;
    }
};
