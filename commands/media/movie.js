import axios from "axios";
import { getCachedConfig } from "../../services/configService.js";
import { BRAND } from "../../brand.js";

const OMDB_KEYS = [process.env.OMDB_KEY, "trilogy", "thewdb", "4a3b711b"].filter(Boolean);

async function omdb(query) {
    for (const key of OMDB_KEYS) {
        try {
            const { data } = await axios.get(`https://www.omdbapi.com/?t=${encodeURIComponent(query)}&plot=short&apikey=${key}`, { timeout: 15000 });
            if (data?.Response === "True") return data;
            if (data?.Error && /not found/i.test(data.Error)) {
                const s = await axios.get(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${key}`, { timeout: 15000 });
                const id = s.data?.Search?.[0]?.imdbID;
                if (id) { const r = await axios.get(`https://www.omdbapi.com/?i=${id}&plot=short&apikey=${key}`, { timeout: 15000 }); if (r.data?.Response === "True") return r.data; }
                return null;
            }
        } catch { /* try next configured key */ }
    }
    return null;
}

export const movie = async (sock, m, args) => {
    const p = getCachedConfig().prefix || "!";
    const jid = m.key.remoteJid;
    const query = args.join(" ").trim();
    if (!query) return `🎬 *MOVIE INFORMATION*\n\n📝 Usage: ${p}movie <name>\n📌 Example: ${p}movie Avengers Endgame\n\nThis command provides movie details and a trailer-search link; it does not distribute full movie files.\n\n${BRAND.footer}`;

    try {
        const data = await omdb(query);
        const title = data?.Title || query;
        const trailerSearch = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} official trailer`)}`;
        const lines = data ? [
            `🎬 *MOVIE INFORMATION*`,
            `📌 *Title:* ${data.Title}`,
            `📅 *Released:* ${data.Released}`,
            `⏱️ *Runtime:* ${data.Runtime}`,
            `🎭 *Genre:* ${data.Genre}`,
            `🎬 *Director:* ${data.Director}`,
            `⭐ *Rating:* ${data.imdbRating} (${data.imdbVotes} votes)`,
            `📝 *Plot:* ${data.Plot}`,
            data.imdbID && data.imdbID !== "N/A" ? `🔎 *IMDb:* https://www.imdb.com/title/${data.imdbID}/` : null,
            `▶️ *Trailer search:* ${trailerSearch}`,
            `\nFull-movie files are not distributed by this bot. Use a licensed streaming or rental service.`,
            BRAND.footer
        ].filter(Boolean) : [
            `⚠️ Movie information was not found for "${query}".`,
            `▶️ *Trailer search:* ${trailerSearch}`,
            `\nThis bot provides search links, not full-movie files.`,
            BRAND.footer
        ].filter(Boolean);

        let poster = null;
        if (data?.Poster && data.Poster !== "N/A") {
            try { poster = Buffer.from((await axios.get(data.Poster, { responseType: "arraybuffer", timeout: 10000 })).data); } catch { }
        }
        const text = lines.join("\n\n");
        await sock.sendMessage(jid, poster ? { image: poster, caption: text } : { text }, { quoted: m });
    } catch (e) {
        console.error("Movie lookup error:", e.message);
        return `❌ Could not look up that movie right now. Please try again later.`;
    }
};
