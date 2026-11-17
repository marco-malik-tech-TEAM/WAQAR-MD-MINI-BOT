import { BRAND, getAsset, getPairUrl } from "../../brand.js";
import { CHANNEL_LINK } from "../../services/channelService.js";
import { getCachedConfig } from "../../services/configService.js";
import { MENU_TEMPLATE } from "../../MENU2_TEMPLATE.js";

const MEDIA_CAPTION_LIMIT = 1024;

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

function menuMedia(label) {
    const isMenu2 = /^MENU\s*2$/i.test(label);
    const media = isMenu2 ? getAsset("welcome-video.mp4") : getAsset("menu.jpeg") || getAsset("logo.png");
    if (!media) return null;
    const config = getCachedConfig();
    const caption = [
        `🤖 ${config.menuTitle || BRAND.name} · ${label}`,
        "Complete command list is in the next message.",
        "Use the leading dot (.) before every command."
    ].join("\n");
    if (caption.length > MEDIA_CAPTION_LIMIT) throw new Error("Menu media caption exceeds WhatsApp's caption limit.");
    return isMenu2 ? { video: media, caption } : { image: media, caption };
}

/** Send actual menu media followed by one complete, untruncated command-list message. */
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
        const media = menuMedia(label);
        if (media) await sock.sendMessage(destination, media, message ? { quoted: message } : undefined);
        await sock.sendMessage(destination, { text, linkPreview: null });
    } finally {
        try {
            await sock.sendPresenceUpdate?.("paused", destination);
        } catch {
            // Presence cleanup is best-effort too.
        }
    }
    return null;
}
