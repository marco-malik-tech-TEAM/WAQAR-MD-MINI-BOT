import axios from "axios";
import { getCachedConfig } from "../../services/configService.js";
import { fetchBuffer } from "../../utils/downloader.js";
import { BRAND } from "../../brand.js";

const UA = "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/124 Mobile Safari/537.36";
const MAX = 95 * 1024 * 1024;

async function aptoide(query) {
    const { data } = await axios.get("https://ws75.aptoide.com/api/7/apps/search", {
        params: { query, limit: 1 }, timeout: 30000, headers: { "User-Agent": UA }
    });
    const app = data?.datalist?.list?.[0];
    if (!app) return null;
    return {
        name: app.name,
        pkg: app.package,
        version: app.file?.vername,
        size: app.file?.filesize || app.size,
        url: app.file?.path || app.file?.path_alt,
        downloads: app.stats?.downloads
    };
}

function appSummary(app) {
    const mb = app.size ? `${(app.size / 1024 / 1024).toFixed(1)} MB` : "size not reported";
    return `📦 *${app.name}*\n🆔 Package: ${app.pkg || "-"}\n🏷️ Version: ${app.version || "-"}\n💾 Size: ${mb}\n⬇️ Downloads: ${app.downloads ?? "-"}`;
}

export const apk = async (sock, m, args) => {
    const prefix = getCachedConfig().prefix || ".";
    const query = args.join(" ").trim();
    if (!query) return `📦 *APK SEARCH*\n\nUsage: ${prefix}apk <app name or package>\nExample: ${prefix}apk whatsapp`;

    try {
        const app = await aptoide(query);
        if (!app?.url) return "❌ No APK result was found. Try the exact app name or Android package ID.";

        let source;
        try { source = new URL(app.url); }
        catch { return "❌ The app provider returned an invalid download link. Try again later."; }
        if (source.protocol !== "https:") return "❌ The app provider returned an insecure download link, so it was not opened.";

        const summary = appSummary(app);
        if (Number(app.size) > MAX) {
            return `${summary}\n\n⚠️ This APK exceeds WhatsApp's 95 MB attachment limit, so it cannot be sent in chat.\n🔗 Official provider download: ${source.href}`;
        }

        const buffer = await fetchBuffer(source.href, 100 * 1024);
        if (!buffer?.length) return "❌ The provider returned an empty APK file. Please retry later.";
        if (buffer.length > MAX) {
            return `${summary}\n\n⚠️ The downloaded file is larger than WhatsApp's 95 MB attachment limit.\n🔗 Official provider download: ${source.href}`;
        }

        const safeName = `${app.name || "app"}-${app.version || "latest"}.apk`.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120);
        await sock.sendMessage(m.key.remoteJid, {
            document: buffer,
            mimetype: "application/vnd.android.package-archive",
            fileName: safeName,
            caption: `${summary}\n\n✅ APK downloaded from the provider.\n💠 Powered by ${BRAND.name}`
        }, { quoted: m });
        return null;
    } catch (error) {
        console.error("APK error:", error.message);
        return "❌ The APK provider or download server is temporarily unavailable. Please retry later or search the app name again.";
    }
};
