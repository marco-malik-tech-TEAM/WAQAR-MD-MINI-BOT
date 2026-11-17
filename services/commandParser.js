/** Parse only explicit dot-prefixed WhatsApp commands. Ordinary text is never a command. */
export function parseDotCommand(text) {
    const trimmed = String(text || "").trim();
    if (!trimmed.startsWith(".")) return null;
    const body = trimmed.slice(1).trim();
    if (!body) return null;
    const [name, ...args] = body.split(/\s+/);
    if (!name) return null;
    return { name: name.toLowerCase(), args };
}
