import { BRAND, getAsset } from "../../brand.js";
import { catalogCategories } from "../catalog/index.js";
import { commands } from "../index.js";
import { COMMAND_ALIASES } from "../../services/commandAliases.js";
import { buildMenuSections, renderMenuTemplate, splitMenuTemplate } from "./menu2-template.js";

export function getMenu2Sections() {
    return buildMenuSections({ commands, catalogCategories, aliases: COMMAND_ALIASES });
}

/** Complete all-command menu as one editable, ready-to-send template string. */
export function getMenu2Template(prefix = ".") {
    return renderMenuTemplate(getMenu2Sections(), prefix);
}

export async function menu2(sock, message) {
    const destination = message?.key?.remoteJid;
    if (!destination) return "Could not determine which chat should receive Menu 2.";

    const image = getAsset("menu.jpeg") || getAsset("logo.png");
    const video = getAsset("welcome-video.mp4");
    if (image) await sock.sendMessage(destination, {
        image,
        caption: `🤖 *${BRAND.name} · MENU 2*`
    }, { quoted: message });
    if (video) await sock.sendMessage(destination, {
        video,
        mimetype: "video/mp4",
        gifPlayback: false,
        caption: `🎬 *${BRAND.name} · WELCOME*`
    }, { quoted: message });

    for (const text of splitMenuTemplate(getMenu2Sections(), ".")) {
        await sock.sendMessage(destination, { text }, { quoted: message });
    }
    return null;
}
