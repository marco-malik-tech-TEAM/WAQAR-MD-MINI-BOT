export const MENU_CORE_CATEGORIES = [
    { title: "General", emoji: "🧭", commands: ["help", "menu", "menu2", "pair", "ping", "botstats", "owner", "creator", "quote"] },
    { title: "Fun", emoji: "🎭", commands: ["ship", "fancy", "joke", "fact", "dare", "truth", "8ball", "pickup", "compliment", "roast", "riddle", "hack", "chai", "muth", "virus", "crash", "matrix", "detective", "spam", "confess", "rate", "flirt", "lovemsg", "loveletter", "crush", "goodmorning", "goodnight", "compatibility", "dateidea"] },
    { title: "Media", emoji: "🎞️", commands: ["apk", "tiktok", "instagram", "facebook", "movie", "sport", "news", "play", "video", "meme", "lyrics", "zodiac", "wallpaper", "waifu"] },
    { title: "Status", emoji: "👤", commands: ["status", "setbio", "setname", "savestatus", "statusdl", "statusdownload", "vv", "viewonce"] },
    { title: "Tools", emoji: "🛠️", commands: ["calc", "qr", "weather", "translate", "define", "aesthetic", "sticker", "github", "password", "wiki", "base64", "ip"] },
    { title: "AI", emoji: "🤖", commands: ["ai", "chatbot"] },
    { title: "Settings", emoji: "⚙️", commands: ["settings", "prefix", "alwaysonline", "autolikestatus", "autoviewstatus", "antidelete", "anticall", "autoread", "alwaystyping", "alwaysrecording", "setownername", "statusreply", "setstatusreply"] },
    { title: "Group Management", emoji: "👥", commands: ["hidetag", "tagall", "kick", "add", "promote", "demote", "mute", "unmute", "groupinfo", "grouplink", "revoke", "leave", "admins", "setgroupname", "setdesc", "welcome", "setwelcome", "goodbye", "setgoodbye", "antilink", "poll", "warn", "resetwarn", "rejoin", "groupantidelete", "bot"] }
];

export const MENU_BORDER = "━━━━━━━━━━━━━━━━━━━━";

/**
 * Build sections from the live dispatcher, the supplied menu categories, and
 * the exact command aliases used by WhatsApp message handling. Edit
 * MENU_CORE_CATEGORIES to move/add core commands; catalog commands are read
 * from commands/catalog/index.js and any unassigned dispatcher keys are kept
 * in an automatic OTHER COMMANDS section.
 */
export function buildMenuSections({ commands, catalogCategories, aliases = {} }) {
    const sections = [];
    const sectionByTitle = new Map();
    const listed = new Set();

    const getOrCreate = (title, emoji = "📦") => {
        const key = title.toLowerCase();
        if (sectionByTitle.has(key)) return sectionByTitle.get(key);
        const section = { title, emoji, commands: [] };
        sectionByTitle.set(key, section);
        sections.push(section);
        return section;
    };
    const add = (section, name) => {
        if (!name || listed.has(name)) return;
        if (name !== "menu" && !commands[name] && !aliases[name]) return;
        listed.add(name);
        section.commands.push(name);
    };

    for (const source of MENU_CORE_CATEGORIES) {
        const section = getOrCreate(source.title, source.emoji);
        for (const name of source.commands) add(section, name);
    }

    for (const [title, names] of Object.entries(catalogCategories || {})) {
        const emoji = MENU_CORE_CATEGORIES.find(item => item.title.toLowerCase() === title.toLowerCase())?.emoji
            || ({ Admin: "🛡️", Owner: "👑", Games: "🎮", Economy: "💰", Anime: "👾", Textmaker: "🖋️", General: "🧭", AI: "🤖", Media: "🎞️", Fun: "🎭" }[title] || "📦");
        const section = getOrCreate(title, emoji);
        for (const name of names) add(section, name);
    }

    const location = new Map();
    for (const section of sections) for (const name of section.commands) location.set(name, section);
    for (const [alias, target] of Object.entries(aliases || {})) {
        if (listed.has(alias)) continue;
        const section = location.get(target) || getOrCreate("General", "🧭");
        add(section, alias);
    }

    const other = Object.keys(commands || {}).filter(name => !listed.has(name));
    if (other.length) {
        const section = getOrCreate("Other", "📦");
        for (const name of other) add(section, name);
    }
    return sections.filter(section => section.commands.length);
}

export function renderMenuSection(section, prefix = ".") {
    const title = `${section.title.toUpperCase()} COMMAND`;
    const lines = section.commands.map(name => `│ ➜ ${prefix}${name}`);
    return `┌${MENU_BORDER}┐\n│ ${section.emoji} ${title}\n└${MENU_BORDER}┘\n${lines.join("\n")}`;
}

/** Return the complete menu as a ready-to-send template string. */
export function renderMenuTemplate(sections, prefix = ".") {
    return sections.map(section => renderMenuSection(section, prefix)).join("\n\n");
}

/** Keep every category intact while splitting large menus into WhatsApp-sized messages. */
export function splitMenuTemplate(sections, prefix = ".", maxChars = 3500) {
    const chunks = [];
    let current = "";
    for (const section of sections) {
        const text = renderMenuSection(section, prefix);
        const candidate = current ? `${current}\n\n${text}` : text;
        if (current && candidate.length > maxChars) {
            chunks.push(current);
            current = text;
        } else {
            current = candidate;
        }
    }
    if (current) chunks.push(current);
    return chunks;
}
