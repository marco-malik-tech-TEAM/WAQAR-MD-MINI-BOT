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
    const thumbnail = getAsset("menu.jpeg") || getAsset("logo.png");
    if (!thumbnail) return undefined;
    const config = getCachedConfig();
    return {
        title: `${config.menuTitle || BRAND.name} · ${label}`,
        body: "Complete command menu · use the dot prefix",
        mediaType: 1,
        thumbnail,
        sourceUrl: getPairUrl() || BRAND.website,
        renderLargerThumbnail: true,
        showAdAttribution: false
    };
}

/** Send the complete menu in exactly one text message; the image is an inline preview. */
export async function sendUnifiedMenu(sock, message, label = "MENU") {
    const destination = message?.key?.remoteJid;
    if (!destination) return "Could not determine which chat should receive the menu.";

    const text = buildUnifiedMenuText(label);
    if (text.length > 60000) return "The full command menu is too large for one WhatsApp message. Please reduce the menu before sending.";

    const externalAdReply = menuPreview(label);
    const payload = { text, linkPreview: null };
    if (externalAdReply) payload.contextInfo = { externalAdReply };
    await sock.sendMessage(destination, payload, message ? { quoted: message } : undefined);
    return null;
}
