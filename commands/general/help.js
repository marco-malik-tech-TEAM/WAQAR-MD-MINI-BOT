import { sendUnifiedMenu } from "./menuSender.js";

const CATEGORY_ICON = {
    General: "🧭", AI: "🤖", Admin: "🛡️", Owner: "👑", Media: "🎞️", Fun: "🎭",
    Games: "🎮", Economy: "💰", Anime: "👾", Textmaker: "🖋️", Status: "👤",
    Tools: "🛠️", Settings: "⚙️", "Group Management": "👥"
};
const COMMAND_ICON = { gayrate: "📊", memegen: "😂" };

export function formatCatalogCategory(category, names, prefix, part = 1, totalParts = 1) {
    const title = `${category.toUpperCase()} COMMANDS${totalParts > 1 ? ` · ${part}/${totalParts}` : ""}`;
    const emoji = CATEGORY_ICON[category] || "📦";
    const rows = names.map(name => `│ ${COMMAND_ICON[name] || emoji} ➜ *${prefix}${name}*`).join("\n");
    return `╭━━『 ${emoji} *${title}* 』━━╮\n${rows}\n╰━━━━━━━━━━━━━━━━━━╯`;
}

export const help = async (sock, message) => sendUnifiedMenu(sock, message, "MENU 1");
