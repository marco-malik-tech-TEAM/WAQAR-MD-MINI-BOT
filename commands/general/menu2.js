import { BRAND, getAsset } from "../../brand.js";
import { getCachedConfig } from "../../services/configService.js";
import { catalogCategories } from "../catalog/index.js";
import { formatCatalogCategory } from "./help.js";
import { commands } from "../index.js";

const CORE_GROUPS = {
    General: ["help", "menu", "menu2", "pair", "ping", "botstats", "owner", "creator", "quote"],
    Fun: ["ship", "fancy", "joke", "fact", "dare", "truth", "8ball", "pickup", "compliment", "roast", "riddle", "hack", "chai", "muth", "virus", "crash", "matrix", "detective", "spam", "confess", "rate", "flirt", "lovemsg", "loveletter", "crush", "goodmorning", "goodnight", "compatibility", "dateidea"],
    Media: ["apk", "tiktok", "instagram", "facebook", "movie", "sport", "news", "play", "video", "meme", "lyrics", "zodiac", "wallpaper", "waifu"],
    Status: ["status", "setbio", "setname", "savestatus", "statusdl", "statusdownload", "vv", "viewonce"],
    Tools: ["calc", "qr", "weather", "translate", "define", "aesthetic", "sticker", "github", "password", "wiki", "base64", "ip"],
    AI: ["ai", "chatbot"],
    Settings: ["settings", "prefix", "alwaysonline", "autolikestatus", "autoviewstatus", "antidelete", "anticall", "autoread", "alwaystyping", "alwaysrecording", "setownername", "statusreply", "setstatusreply"],
    "Group Management": ["hidetag", "tagall", "kick", "add", "promote", "demote", "mute", "unmute", "groupinfo", "grouplink", "revoke", "leave", "admins", "setgroupname", "setdesc", "welcome", "setwelcome", "goodbye", "setgoodbye", "antilink", "poll", "warn", "resetwarn", "rejoin", "groupantidelete", "bot"]
};

export async function menu2(sock, message) {
    const config = getCachedConfig();
    const prefix = config.prefix || ".";
    const destination = message?.key?.remoteJid;
    if (!destination) return "Could not determine which chat should receive Menu 2.";

    const catalogNames = new Set(Object.values(catalogCategories).flat());
    const shown = new Set();
    const sections = [];
    for (const [category, names] of Object.entries(CORE_GROUPS)) {
        const entries = names.filter(name => (name === "menu" || commands[name]) && !catalogNames.has(name) && !shown.has(name));
        entries.forEach(name => shown.add(name));
        if (entries.length) sections.push([category, entries]);
    }
    for (const [category, names] of Object.entries(catalogCategories)) {
        const entries = names.filter(name => commands[name] && !shown.has(name));
        entries.forEach(name => shown.add(name));
        if (entries.length) sections.push([category, entries]);
    }
    const unassigned = Object.keys(commands).filter(name => !shown.has(name));
    if (unassigned.length) {
        unassigned.forEach(name => shown.add(name));
        sections.push(["Other Commands", unassigned]);
    }
    const count = shown.size;
    const title = config.menuTitle || BRAND.name;
    const image = getAsset("menu.jpeg") || getAsset("logo.png");
    const video = getAsset("welcome-video.mp4");

    if (image) await sock.sendMessage(destination, {
        image,
        caption: `╭━━『 🧭 *${title} · MENU 2* 』━━╮\n📦 ${count} commands\n╰━━━━━━━━━━━━━━━━━━━━╯`
    });
    if (video) await sock.sendMessage(destination, {
        video,
        mimetype: "video/mp4",
        gifPlayback: false,
        caption: `🎬 *${title} — Welcome*\nUse ${prefix}menu2 to reopen this command menu.`
    });

    const intro = `╭━━『 📚 *${title} · MENU 2* 』━━╮\n│ Prefix: *${prefix}*\n│ Owner: *${config.menuOwnerName || "Marco Malik"}*\n│ Command entries: *${count}*\n│ Each command is listed once below.\n╰━━━━━━━━━━━━━━━━━━━━╯\n\n${BRAND.footer}`;
    await sock.sendMessage(destination, { text: intro });

    for (const [category, names] of sections) {
        const chunkSize = 28;
        const totalParts = Math.ceil(names.length / chunkSize);
        for (let offset = 0; offset < names.length; offset += chunkSize) {
            const page = Math.floor(offset / chunkSize) + 1;
            await sock.sendMessage(destination, {
                text: formatCatalogCategory(category, names.slice(offset, offset + chunkSize), prefix, page, totalParts)
            });
        }
    }
    return null;
}
