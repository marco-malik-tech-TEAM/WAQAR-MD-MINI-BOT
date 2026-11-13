import axios from "axios";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";
import { randomBytes } from "crypto";

const UA = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36";
const MAX_BYTES = 95 * 1024 * 1024; // WhatsApp practical limit

export function isPublicTelegramPost(value) {
    try {
        const u = new URL(value);
        return u.protocol === "https:" && ["t.me", "www.t.me"].includes(u.hostname.toLowerCase()) &&
            /^\/[A-Za-z0-9_]{4,64}\/\d+\/?$/.test(u.pathname);
    } catch {
        return false;
    }
}

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

/** Download a publicly accessible Telegram channel post supported by yt-dlp. */
export function ytdlp(url, kind = "video") {
    return new Promise((resolve, reject) => {
        if (kind !== "video" || !isPublicTelegramPost(url)) {
            return reject(new Error("Only publicly accessible Telegram channel video posts are supported here."));
        }
        const id = randomBytes(6).toString("hex");
        const base = path.join(os.tmpdir(), `dl_${id}`);
        const out = `${base}.%(ext)s`;
        const common = [
            "--no-playlist", "--no-warnings", "--socket-timeout", "30", "--retries", "3",
            "--max-filesize", "90M", "--user-agent", UA,
            "-o", out
        ];
        const fmt = ["-f", "best[ext=mp4]/best", "--merge-output-format", "mp4"];

        const bins = [path.resolve("./bin/yt-dlp"), "yt-dlp"];
        const tryBin = (i) => {
            if (i >= bins.length) return reject(new Error("yt-dlp not available"));
            let err = "";
            let child;
            try { child = spawn(bins[i], [...fmt, ...common, url]); } catch (e) { return tryBin(i + 1); }
            let completed = false;
            let timer;
            const cleanup = () => fs.readdirSync(os.tmpdir()).filter(f => f.startsWith(`dl_${id}`)).forEach(f => { try { fs.unlinkSync(path.join(os.tmpdir(), f)); } catch { } });
            child.once("error", () => {
                if (completed) return;
                completed = true;
                clearTimeout(timer);
                tryBin(i + 1);
            });
            child.stderr.on("data", d => { err += d.toString(); });
            child.once("close", (code) => {
                if (completed) return;
                completed = true;
                clearTimeout(timer);
                const dir = os.tmpdir();
                const file = fs.readdirSync(dir).find(f => f.startsWith(`dl_${id}.`) && !f.endsWith(".txt") && !f.endsWith(".part"));
                if (code === 0 && file) {
                    const full = path.join(dir, file);
                    try {
                        if (fs.statSync(full).size > MAX_BYTES) throw new Error("Telegram video exceeds WhatsApp's 95 MB attachment limit.");
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
                reject(new Error("Telegram video download timed out after four minutes."));
            }, 4 * 60 * 1000);
        };
        tryBin(0);
    });
}

const first = (...v) => v.find(x => typeof x === "string" && x.startsWith("http"));
const getJSON = async (url, opts = {}) => (await axios.get(url, { timeout: 45000, headers: { "User-Agent": UA }, ...opts })).data;

// ---------- Public-platform provider chains (no YouTube extraction endpoints) ----------
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
 * Main entry. site: telegram | tiktok | instagram | facebook | youtube | generic
 * kind: audio | video
 * YouTube is link-only; yt-dlp is limited to public Telegram channel posts.
 */
export async function downloadMedia(url, { site = "generic", kind = "video" } = {}) {
    const errors = [];
    const apiChain = (
        site === "tiktok" ? tiktokProviders(url) :
        site === "instagram" ? instaProviders(url) :
        site === "facebook" ? facebookProviders(url) : []
    );

    if (site === "youtube") {
        throw new Error("YouTube audio/video file downloads are not provided. Use the official YouTube link or a licensed source.");
    }
    if (site === "telegram") {
        return { buffer: await ytdlp(url, kind), via: "yt-dlp" };
    }

    // Existing social-media providers are tried in order, with every result validated as media.
    for (let i = 0; i < apiChain.length; i++) {
        try {
            const direct = await apiChain[i]();
            if (!direct) { errors.push(`api#${i + 1}: no link`); continue; }
            const buffer = await fetchBuffer(direct, kind === "audio" ? 20 * 1024 : 30 * 1024);
            return { buffer, via: `api#${i + 1}` };
        } catch (e) {
            errors.push(`api#${i + 1}: ${(e.code || e.message || "").toString().slice(0, 80)}`);
        }
    }
    const err = new Error("All download methods failed");
    err.details = errors;
    throw err;
}

export const detectSite = (u = "") => {
    if (/(youtube\.com|youtu\.be)/i.test(u)) return "youtube";
    if (isPublicTelegramPost(u)) return "telegram";
    if (/(tiktok\.com)/i.test(u)) return "tiktok";
    if (/(instagram\.com|instagr\.am)/i.test(u)) return "instagram";
    if (/(facebook\.com|fb\.watch|fb\.com)/i.test(u)) return "facebook";
    return "generic";
};
export const firstUrl = (s = "") => (s.match(/https?:\/\/[^\s]+/i) || [])[0];


const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/** Resolve short links (vt.tiktok.com etc.) and strip tracking params */
export async function expandUrl(u) {
    try {
        const r = await axios.get(u, { maxRedirects: 8, timeout: 15000, headers: { "User-Agent": UA }, validateStatus: () => true, responseType: "text", maxContentLength: 2 * 1024 * 1024 });
        const final = r.request?.res?.responseUrl || u;
        return final.split("?")[0] || u;
    } catch { return u.split("?")[0]; }
}

/** TikTok: returns { buffer, info:{title,author,id,views,likes,date,duration} } */
export async function tiktokDownload(rawUrl) {
    const errors = [];
    const urls = [...new Set([rawUrl, await expandUrl(rawUrl)])];
    let info = {};
    const absolute = (x) => (x ? (x.startsWith("http") ? x : "https://www.tikwm.com" + x) : null);

    for (const u of urls) {
        // tikwm (GET, then POST), with retry for its "1 request/second" limit
        for (const mode of ["get", "post", "get"]) {
            try {
                let d;
                if (mode === "get") d = (await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(u)}&hd=1`, { timeout: 30000, headers: { "User-Agent": UA } })).data;
                else d = (await axios.post("https://www.tikwm.com/api/", new URLSearchParams({ url: u, hd: "1" }).toString(), { timeout: 30000, headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" } })).data;
                const x = d?.data;
                if (!x || d.code !== 0) { errors.push(`tikwm: ${d?.msg || "no data"}`); await sleep(1500); continue; }
                info = {
                    title: x.title, author: x.author?.nickname, username: x.author?.unique_id, id: x.author?.id,
                    views: x.play_count, likes: x.digg_count, comments: x.comment_count, shares: x.share_count,
                    date: x.create_time ? new Date(x.create_time * 1000) : null, duration: x.duration
                };
                for (const link of [absolute(x.hdplay), absolute(x.play), absolute(x.wmplay)].filter(Boolean)) {
                    try { return { buffer: await fetchBuffer(link, 30 * 1024), info, via: "tikwm" }; } catch (e) { errors.push(`tikwm-dl: ${e.message.slice(0, 60)}`); }
                }
            } catch (e) { errors.push(`tikwm: ${(e.code || e.message || "").toString().slice(0, 60)}`); await sleep(1500); }
        }
        // other providers
        for (const fn of tiktokProviders(u).slice(1)) {
            try { const link = await fn(); if (link) return { buffer: await fetchBuffer(link, 30 * 1024), info, via: "api" }; } catch (e) { errors.push(`api: ${(e.code || e.message || "").toString().slice(0, 60)}`); }
        }
        try {
            const d = (await axios.get(`https://api.tiklydown.eu.org/api/download/v5?url=${encodeURIComponent(u)}`, { timeout: 30000 })).data;
            const link = first(d?.result?.video1, d?.result?.video_hd, d?.result?.video2, d?.video?.noWatermark);
            if (link) return { buffer: await fetchBuffer(link, 30 * 1024), info, via: "tiklydown" };
        } catch (e) { errors.push("tiklydown"); }
        // TikTok fallback via yt-dlp intentionally disabled: this downloader is limited to public Telegram posts.
    }
    const err = new Error("TikTok download failed"); err.details = errors; throw err;
}
