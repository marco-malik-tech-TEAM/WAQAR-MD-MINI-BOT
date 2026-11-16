import yts from "yt-search";
import axios from "axios";
import { getCachedConfig } from "../../services/configService.js";
import { downloadMedia, downloadFailureHint, firstUrl, detectSite, buildYouTubeTarget } from "../../utils/downloader.js";
import { BRAND } from "../../brand.js";

export const play = async (sock, m, args) => {
    const p = getCachedConfig().prefix || "!";
    const jid = m.key.remoteJid;
    const query = args.join(" ").trim();
    if (!query) return `🎵 *MUSIC / MP3 DOWNLOADER*\n\n📝 Usage: ${p}play <song name or YouTube link>\n📌 Example: ${p}play Light Jesus\n\n${BRAND.footer}`;

    try {
        const link = firstUrl(query);
        if (link && detectSite(link) !== "youtube") {
            return `❌ For audio downloads, provide a song name or YouTube link. Example: ${p}play Light Jesus`;
        }

        let video;
        if (link) {
            // Skip metadata search for direct links so a blocked search API cannot block the download.
            video = { title: "YouTube audio", timestamp: "-", views: "-", url: link };
        } else {
            try { video = (await yts(query)).videos?.[0]; } catch { /* yt-dlp search is the next fallback. */ }
            if (!video) video = { title: query, timestamp: "-", views: "-", url: buildYouTubeTarget(query, null) };
        }

        const title = video.title || query || "YouTube audio";
        const displayUrl = video.url.startsWith("ytsearch1:") ? "YouTube search fallback" : video.url;
        const info = `🎵 *PLAYING MUSIC*\n\n📌 *Title:* ${title}\n⏱️ *Duration:* ${video.timestamp || video.duration?.timestamp || "-"}\n👀 *Views:* ${video.views || "-"}\n🔗 *Source:* ${displayUrl}\n\n_Downloading audio... please wait_ ⏳`;
        let thumb;
        try { if (video.thumbnail || video.image) thumb = Buffer.from((await axios.get(video.thumbnail || video.image, { responseType: "arraybuffer", timeout: 8000 })).data); } catch { }
        await sock.sendMessage(jid, thumb ? { image: thumb, caption: info } : { text: info }, { quoted: m });

        try {
            const { buffer } = await downloadMedia(video.url, { site: "youtube", kind: "audio" });
            await sock.sendMessage(jid, { audio: buffer, mimetype: "audio/mpeg", fileName: `${title}.mp3` }, { quoted: m });
        } catch (e) {
            console.error("Audio download failed:", e.message, e.details);
            await sock.sendMessage(jid, { text: `❌ *Audio download failed.*\n\n💡 ${downloadFailureHint(e)}\n\n🔗 ${displayUrl}` }, { quoted: m });
        }
    } catch (err) {
        console.error("Play error:", err.message);
        return `❌ Failed to process music request.`;
    }
};
