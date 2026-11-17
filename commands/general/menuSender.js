import { BRAND, getAsset, getPairUrl } from "../../brand.js";
import { CHANNEL_LINK } from "../../services/channelService.js";
import { getCachedConfig } from "../../services/configService.js";
import { MENU_TEMPLATE } from "../../MENU2_TEMPLATE.js";

export function buildUnifiedMenuText(label = "MENU") {
    const config = getCachedConfig();
    const title = config.menuTitle || BRAND.name;
    const owner = config.menuOwnerName || "Marco Malik";
    const pairUrl = getPairUrl();
    const lines = [
        `╭───『 🤖 ${title} ${BRAND.version} · ${label} 』───╮`,
        `│ 👑 Owner: ${owner}`,
        "│ ⚙️ Every command requires the leading dot (.).",
        "╰──────────────────────────────╯",
        "",
        MENU_TEMPLATE,
        "",
        `🌐 Info: ${BRAND.website}`,
        pairUrl ? `🔗 Pairing page: ${pairUrl}` : "🔗 Pairing page: configure PUBLIC_URL or Railway's public domain.",
        `📢 Channel: ${CHANNEL_LINK}`,
        `💠 Powered by ${BRAND.name}`
    ];
    return lines.join("\n");
}

function menuPreview(label) {
    const isMenu2 = /^MENU\s*2$/i.test(label);
    const thumbnail = isMenu2 ? getAsset("menu2-preview.jpg") : getAsset("menu.jpeg") || getAsset("logo.png");
    if (!thumbnail) return undefined;
    const config = getCachedConfig();
    const pairUrl = getPairUrl();
    const videoUrl = isMenu2 && pairUrl ? `${pairUrl.replace(/\/pair\/?$/i, "")}/media/menu2.mp4` : undefined;
    return {
        title: `${config.menuTitle || BRAND.name} · ${label}`,
        body: "Complete command menu · use the dot prefix",
        mediaType: isMenu2 ? 2 : 1,
        ...(videoUrl ? { mediaUrl: videoUrl } : {}),
        thumbnail,
        sourceUrl: videoUrl || pairUrl || BRAND.website,
        renderLargerThumbnail: true,
        showAdAttribution: false
    };
}

/** Send the complete menu and its image/video preview together in one WhatsApp message. */
export async function sendUnifiedMenu(sock, message, label = "MENU") {
    const destination = message?.key?.remoteJid;
    if (!destination) return "Could not determine which chat should receive the menu.";

    const text = buildUnifiedMenuText(label);
    if (text.length > 60000) return "The full command menu is too large for one WhatsApp message. Please reduce the menu before sending.";

    try {
        await sock.sendPresenceUpdate?.("composing", destination);
    } catch {
        // Typing presence is best-effort; it must not block menu delivery.
    }

    try {
        const externalAdReply = menuPreview(label);
        const payload = { text, linkPreview: null };
        if (externalAdReply) payload.contextInfo = { externalAdReply };
        await sock.sendMessage(destination, payload, message ? { quoted: message } : undefined);
    } finally {
        try {
            await sock.sendPresenceUpdate?.("paused", destination);
        } catch {
            // Presence cleanup is best-effort too.
        }
    }
    return null;
}
