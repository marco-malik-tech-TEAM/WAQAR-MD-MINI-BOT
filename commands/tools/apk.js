import axios from "axios";
import { getCachedConfig } from "../../services/configService.js";
import { fetchBuffer } from "../../utils/downloader.js";
import { BRAND } from "../../brand.js";

const UA = "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/124 Mobile Safari/537.36";
const MAX = 95 * 1024 * 1024;

async function aptoide(q) {
    const { data } = await axios.get(`https://ws75.aptoide.com/api/7/apps/search`, { params: { query: q, limit: 1 }, timeout: 30000, headers: { "User-Agent": UA } });
    const a = data?.datalist?.list?.[0];
    if (!a) return null;
    return { name: a.name, pkg: a.package, ver: a.file?.vername, size: a.file?.filesize || a.size, url: a.file?.path || a.file?.path_alt, icon: a.icon, downloads: a.stats?.downloads };
}

export const apk = async (sock, m, args) => {
    const p = getCachedConfig().prefix || ".";
    const jid = m.key.remoteJid;
    const q = args.join(" ").trim();
    if (!q) return `📦 *APK DOWNLOADER*\n\n📝 Usage: ${p}apk <app name or package>\n📌 Example: ${p}apk whatsapp\n📌 Example: ${p}apk com.instagram.android`;

    await sock.sendMessage(jid, { text: `🔍 Searching *${q}*... ⏳` }, { quoted: m });
    try {
        let app = await aptoide(q);
        if (!app?.url) return `❌ App not found. Try the exact name or package id.`;
        const mb = app.size ? (app.size / 1024 / 1024).toFixed(1) : "?";
        const info = `📦 *APK FOUND*\n\n📱 *Name:* ${app.name}\n🆔 *Package:* ${app.pkg}\n🏷️ *Version:* ${app.ver || "-"}\n💾 *Size:* ${mb} MB\n⬇️ *Downloads:* ${app.downloads ?? "-"}\n\n_Downloading APK... please wait_ ⏳`;
        let icon; try { if (app.icon) icon = Buffer.from((await axios.get(app.icon, { responseType: "arraybuffer", timeout: 10000 })).data); } catch { }
        await sock.sendMessage(jid, icon ? { image: icon, caption: info } : { text: info }, { quoted: m });

        if (app.size && app.size > MAX) return `⚠️ File is ${mb} MB — too large for WhatsApp (limit ~95 MB).\n🔗 Direct link: ${app.url}`;
        const buffer = await fetchBuffer(app.url, 100 * 1024);
        await sock.sendMessage(jid, { document: buffer, mimetype: "application/vnd.android.package-archive", fileName: `${app.name}-${app.ver || ""}.apk`.replace(/\s+/g, "_"), caption: `✅ *${app.name}*\n\n💠 *Powered by ${BRAND.name}*` }, { quoted: m });
    } catch (e) {
        console.error("APK error:", e.message);
        return `❌ APK download failed: ${e.message.slice(0, 100)}`;
    }
};
