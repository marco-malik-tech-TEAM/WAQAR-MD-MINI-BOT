import axios from "axios";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";
import { randomBytes } from "crypto";

const UA = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36";
const MAX_BYTES = 95 * 1024 * 1024; // WhatsApp practical limit

/** Download a direct media URL into a Buffer and validate it is really media (not an HTML error page). */
export async function fetchBuffer(url, minBytes = 10 * 1024) {
    const res = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 120000,
        maxContentLength: MAX_BYTES,
        maxBodyLength: MAX_BYTES,
        headers: { "User-Agent": UA, Accept: "*/*" },
        maxRedirects: 5
    });
    const type = String(res.headers["content-type"] || "").toLowerCase();
    const buf = Buffer.from(res.data);
    if (type.includes("text/html") || type.includes("application/json") || buf.length < minBytes) {
        throw new Error(`Invalid media (type=${type || "?"}, size=${buf.length}B)`);
    }
    return buf;
}

/** Run yt-dlp (works for YouTube, TikTok, Instagram, Facebook, Twitter...) */
export function ytdlp(url, kind = "video") {
    return new Promise((resolve, reject) => {
        const id = randomBytes(6).toString("hex");
        const base = path.join(os.tmpdir(), `dl_${id}`);
        const out = `${base}.%(ext)s`;
        const common = [
            "--no-playlist", "--no-warnings", "--geo-bypass", "--force-ipv4",
            "--socket-timeout", "30", "--retries", "3", "--no-check-certificates", "--max-filesize", "90M",
            "--extractor-args", "youtube:player_client=tv,ios,web_safari,android",
            "--user-agent", UA,
            "-o", out
        ];
        // Optional cookies (fixes "Sign in to confirm you're not a bot"): set YT_COOKIES env = path or raw cookies.txt content
        let cookieFile = null;
        if (process.env.YT_COOKIES) {
            try {
                const v = process.env.YT_COOKIES;
                if (fs.existsSync(v)) cookieFile = v;
                else { cookieFile = `${base}.cookies.txt`; fs.writeFileSync(cookieFile, v); }
                common.push("--cookies", cookieFile);
            } catch { /* ignore */ }
        }
        const fmt = kind === "audio"
            ? ["-f", "bestaudio[ext=m4a]/bestaudio/best", "-x", "--audio-format", "mp3", "--audio-quality", "5"]
            : ["-f", "best[ext=mp4][filesize<90M]/best[ext=mp4]/bestvideo[ext=mp4][height<=720]+bestaudio[ext=m4a]/best", "--merge-output-format", "mp4"];

        const bins = [path.resolve("./bin/yt-dlp"), "yt-dlp"];
        const tryBin = (i) => {
            if (i >= bins.length) return reject(new Error("yt-dlp not available"));
            let err = "";
            let child;
            try { child = spawn(bins[i], [...fmt, ...common, url]); } catch (e) { return tryBin(i + 1); }
            let completed = false;
            let timer;
            const cleanup = () => {
                try { fs.readdirSync(os.tmpdir()).filter(f => f.startsWith(`dl_${id}`)).forEach(f => { try { fs.unlinkSync(path.join(os.tmpdir(), f)); } catch { } }); } catch { }
            };
            child.stdout?.resume();
            child.stderr.on("data", d => { err += d.toString(); });
            child.once("error", () => {
                if (completed) return;
                completed = true;
                clearTimeout(timer);
                cleanup();
                tryBin(i + 1);
            });
            child.once("close", (code) => {
                if (completed) return;
                completed = true;
                clearTimeout(timer);
                const dir = os.tmpdir();
                const file = fs.readdirSync(dir).find(f => f.startsWith(`dl_${id}.`) && !f.endsWith(".txt") && !f.endsWith(".part"));
                if (code === 0 && file) {
                    const full = path.join(dir, file);
                    try {
                        if (fs.statSync(full).size > MAX_BYTES) throw new Error("Downloaded file exceeds WhatsApp's 95 MB limit.");
                        const buf = fs.readFileSync(full);
                        cleanup();
                        return resolve(buf);
                    } catch (e) { cleanup(); return reject(e); }
                }
                cleanup();
                reject(new Error(`yt-dlp: ${(err.split("\n").filter(Boolean).pop() || "failed").slice(0, 200)}`));
            });
            timer = setTimeout(() => {
                if (completed) return;
                completed = true;
                child.kill("SIGTERM");
                cleanup();
                reject(new Error("yt-dlp download timed out after five minutes."));
            }, 5 * 60 * 1000);
        };
        tryBin(0);
    });
}

const first = (...v) => v.find(x => typeof x === "string" && x.startsWith("http"));
const getJSON = async (url, opts = {}) => (await axios.get(url, { timeout: 45000, headers: { "User-Agent": UA }, ...opts })).data;

// ---------- Provider chains (each returns a direct media URL) ----------
const ytAudioProviders = (u) => [
    async () => { const d = await getJSON(`https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(u)}`); return first(d?.data?.dl, d?.data?.url, d?.result?.download?.url); },
    async () => { const d = await getJSON(`https://api.ryzendesu.vip/api/downloader/ytmp3?url=${encodeURIComponent(u)}`); return first(d?.url, d?.data?.url, d?.result?.url); },
    async () => { const d = await getJSON(`https://api.vreden.my.id/api/ytmp3?url=${encodeURIComponent(u)}`); return first(d?.result?.download?.url, d?.result?.url); },
    async () => { const d = await getJSON(`https://api.agatz.xyz/api/ytmp3?url=${encodeURIComponent(u)}`); return first(d?.data?.downloadUrl, d?.data?.url); }
];
const ytVideoProviders = (u) => [
    async () => { const d = await getJSON(`https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(u)}`); return first(d?.data?.dl, d?.data?.url, d?.result?.download?.url); },
    async () => { const d = await getJSON(`https://api.ryzendesu.vip/api/downloader/ytmp4?url=${encodeURIComponent(u)}`); return first(d?.url, d?.data?.url, d?.result?.url); },
    async () => { const d = await getJSON(`https://api.vreden.my.id/api/ytmp4?url=${encodeURIComponent(u)}`); return first(d?.result?.download?.url, d?.result?.url); },
    async () => { const d = await getJSON(`https://api.agatz.xyz/api/ytmp4?url=${encodeURIComponent(u)}`); return first(d?.data?.downloadUrl, d?.data?.url); }
];
const tiktokProviders = (u) => [
    async () => { const d = await getJSON(`https://www.tikwm.com/api/?url=${encodeURIComponent(u)}&hd=1`); const x = d?.data; if (!x) return null; const r = x.hdplay || x.play; return r?.startsWith("http") ? r : (r ? "https://www.tikwm.com" + r : null); },
    async () => { const d = await getJSON(`https://api.siputzx.my.id/api/tiktok?url=${encodeURIComponent(u)}`); return first(d?.data?.urls?.[0], d?.data?.video?.play, d?.data?.play); },
    async () => { const d = await getJSON(`https://api.ryzendesu.vip/api/downloader/ttdl?url=${encodeURIComponent(u)}`); return first(d?.data?.data?.play, d?.data?.play, d?.result?.video?.url); }
];
const instaProviders = (u) => [
    async () => { const d = await getJSON(`https://api.siputzx.my.id/api/d/igdl?url=${encodeURIComponent(u)}`); const a = d?.data; return first(a?.[0]?.url, a?.url); },
    async () => { const d = await getJSON(`https://api.ryzendesu.vip/api/downloader/igdl?url=${encodeURIComponent(u)}`); return first(d?.data?.[0]?.url, d?.result?.[0]?.url); },
    async () => { const d = await getJSON(`https://api.vreden.my.id/api/igdownload?url=${encodeURIComponent(u)}`); return first(d?.result?.response?.data?.[0]?.url, d?.result?.[0]?.url); }
];
const facebookProviders = (u) => [
    async () => { const d = await getJSON(`https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(u)}`); return first(d?.data?.hd, d?.data?.sd, d?.data?.[0]?.url); },
    async () => { const d = await getJSON(`https://api.ryzendesu.vip/api/downloader/fbdl?url=${encodeURIComponent(u)}`); return first(d?.data?.[0]?.hd, d?.data?.[0]?.sd, d?.data?.hd, d?.data?.sd, d?.result?.hd, d?.result?.sd); },
    async () => { const d = await getJSON(`https://api.vreden.my.id/api/fbdl?url=${encodeURIComponent(u)}`); return first(d?.data?.hd_url, d?.data?.sd_url, d?.result?.hd, d?.result?.sd); }
];

/**
 * Main entry. site: youtube | tiktok | instagram | facebook | generic
 * kind: audio | video
 * Order: local yt-dlp -> public API chain (with real-media validation each time)
 */
export async function downloadMedia(url, { site = "generic", kind = "video" } = {}) {
    const errors = [];
    const apiChain = (
        site === "youtube" ? (kind === "audio" ? ytAudioProviders(url) : ytVideoProviders(url)) :
        site === "tiktok" ? tiktokProviders(url) :
        site === "instagram" ? instaProviders(url) :
        site === "facebook" ? facebookProviders(url) : []
    );

    // TikTok is more reliable through the bundled extractor than public mirrors.
    const order = (site === "youtube" || site === "tiktok") ? ["ytdlp", "api"] : ["api", "ytdlp"];
    for (const step of order) {
        if (step === "ytdlp") {
            try { return { buffer: await ytdlp(url, kind), via: "yt-dlp" }; }
            catch (e) { errors.push(e.message); }
        } else {
            for (let i = 0; i < apiChain.length; i++) {
                try {
                    const direct = await apiChain[i]();
                    if (!direct) { errors.push(`api#${i + 1}: no link`); continue; }
                    const buffer = await fetchBuffer(direct, kind === "audio" ? 20 * 1024 : 30 * 1024);
                    return { buffer, via: `api#${i + 1}` };
                } catch (e) { errors.push(`api#${i + 1}: ${(e.code || e.message || "").toString().slice(0, 80)}`); }
            }
        }
    }
    const err = new Error("All download methods failed");
    err.details = errors;
    throw err;
}

export const detectSite = (u = "") => {
    if (/(youtube\.com|youtu\.be)/i.test(u)) return "youtube";
    if (/(tiktok\.com)/i.test(u)) return "tiktok";
    if (/(instagram\.com|instagr\.am)/i.test(u)) return "instagram";
    if (/(facebook\.com|fb\.watch|fb\.com)/i.test(u)) return "facebook";
    return "generic";
};
export const firstUrl = (s = "") => {
    const match = s.match(/https?:\/\/[^\s]+/i);
    return match?.[0]?.replace(/[),.!?]+$/g, "");
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const isTikTokHost = host => host === "tiktok.com" || host.endsWith(".tiktok.com");

/** Resolve TikTok short links without following redirects to non-TikTok hosts. */
export async function expandUrl(value) {
    try {
        let current = new URL(value);
        if (current.protocol !== "https:" || !isTikTokHost(current.hostname.toLowerCase())) return value;
        for (let i = 0; i < 8; i++) {
            let response;
            try {
                response = await axios.get(current.href, {
                    maxRedirects: 0,
                    timeout: 15000,
                    headers: { "User-Agent": UA },
                    validateStatus: () => true,
                    responseType: "text",
                    maxContentLength: 2 * 1024 * 1024
                });
            } catch (error) {
                const location = error.response?.headers?.location;
                if (!location) return current.href.split("?")[0];
                const next = new URL(location, current);
                if (next.protocol !== "https:" || !isTikTokHost(next.hostname.toLowerCase())) throw new Error("TikTok redirect left the allowed host set.");
                current = next;
                continue;
            }
            if (response.status >= 300 && response.status < 400 && response.headers.location) {
                const next = new URL(response.headers.location, current);
                if (next.protocol !== "https:" || !isTikTokHost(next.hostname.toLowerCase())) throw new Error("TikTok redirect left the allowed host set.");
                current = next;
                continue;
            }
            const finalUrl = response.request?.res?.responseUrl;
            if (finalUrl) {
                const final = new URL(finalUrl);
                if (final.protocol === "https:" && isTikTokHost(final.hostname.toLowerCase())) current = final;
            }
            return current.href.split("?")[0];
        }
        return current.href.split("?")[0];
    } catch {
        return value;
    }
}

/** Download a TikTok video and return { buffer, info, via } for the existing command handler. */
export async function tiktokDownload(rawUrl) {
    let original;
    try {
        original = new URL(rawUrl);
        if (original.protocol !== "https:" || !isTikTokHost(original.hostname.toLowerCase())) throw new Error("Expected an HTTPS TikTok link.");
    } catch {
        throw new Error("Please provide a valid HTTPS TikTok link.");
    }

    const errors = [];
    const urls = [...new Set([rawUrl, await expandUrl(rawUrl)])];
    let info = {};
    const absolute = value => value ? (value.startsWith("http") ? value : `https://www.tikwm.com${value}`) : null;

    for (const url of urls) {
        for (const mode of ["get", "post", "get"]) {
            try {
                let data;
                if (mode === "get") {
                    data = (await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`, { timeout: 30000, headers: { "User-Agent": UA } })).data;
                } else {
                    data = (await axios.post("https://www.tikwm.com/api/", new URLSearchParams({ url, hd: "1" }).toString(), {
                        timeout: 30000,
                        headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" }
                    })).data;
                }
                const item = data?.data;
                if (!item || data.code !== 0) {
                    errors.push(`tikwm: ${data?.msg || "no data"}`);
                    await sleep(1200);
                    continue;
                }
                info = {
                    title: item.title,
                    author: item.author?.nickname,
                    username: item.author?.unique_id,
                    id: item.author?.id,
                    views: item.play_count,
                    likes: item.digg_count,
                    comments: item.comment_count,
                    shares: item.share_count,
                    date: item.create_time ? new Date(item.create_time * 1000) : null,
                    duration: item.duration
                };
                for (const link of [absolute(item.hdplay), absolute(item.play), absolute(item.wmplay)].filter(Boolean)) {
                    try { return { buffer: await fetchBuffer(link, 30 * 1024), info, via: "tikwm" }; }
                    catch (error) { errors.push(`tikwm-dl: ${error.message.slice(0, 60)}`); }
                }
            } catch (error) {
                errors.push(`tikwm: ${(error.code || error.message || "").toString().slice(0, 60)}`);
                await sleep(1200);
            }
        }

        for (const provider of tiktokProviders(url).slice(1)) {
            try {
                const direct = await provider();
                if (direct) return { buffer: await fetchBuffer(direct, 30 * 1024), info, via: "api" };
            } catch (error) { errors.push(`api: ${(error.code || error.message || "").toString().slice(0, 60)}`); }
        }
        try {
            const data = (await axios.get(`https://api.tiklydown.eu.org/api/download/v5?url=${encodeURIComponent(url)}`, { timeout: 30000 })).data;
            const direct = first(data?.result?.video1, data?.result?.video_hd, data?.result?.video2, data?.video?.noWatermark);
            if (direct) return { buffer: await fetchBuffer(direct, 30 * 1024), info, via: "tiklydown" };
        } catch (error) { errors.push("tiklydown"); }
    }

    const error = new Error("TikTok download failed");
    error.details = errors;
    throw error;
}
