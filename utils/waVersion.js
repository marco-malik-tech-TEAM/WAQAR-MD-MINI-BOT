import { fetchLatestBaileysVersion } from "@whiskeysockets/baileys";

let cached = null;
let cachedAt = 0;

/** Latest WhatsApp Web version (fixes "Connection Closed 405"). Falls back silently if lookup fails. */
export async function getWaVersion() {
    if (cached && Date.now() - cachedAt < 30 * 60 * 1000) return cached;
    try {
        const { version } = await fetchLatestBaileysVersion();
        if (Array.isArray(version)) { cached = version; cachedAt = Date.now(); console.log(`🌐 WA version: ${version.join(".")}`); return cached; }
    } catch (e) {
        console.warn("⚠️ Could not fetch latest WA version:", e.message);
    }
    return undefined; // Baileys default
}
