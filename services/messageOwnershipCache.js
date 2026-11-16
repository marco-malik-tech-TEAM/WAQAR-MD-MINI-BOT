const ownership = new Map();
const MAX_ENTRIES = 2000;
const TTL_MS = 60 * 60 * 1000;

const normalizeJid = jid => String(jid || "").replace(/:\d+(?=@)/, "");

function trimCache(now = Date.now()) {
    for (const [key, entry] of ownership) {
        if (now - entry.cachedAt > TTL_MS) ownership.delete(key);
    }
    while (ownership.size > MAX_ENTRIES) ownership.delete(ownership.keys().next().value);
}

/** Store only message ID/chat/sender metadata, never message text or media bytes. */
export function recordMessageOwnership(message, ownJid = "") {
    const key = message?.key;
    const chatJid = normalizeJid(key?.remoteJid);
    if (!key?.id || !chatJid || !message?.message) return false;
    if (!chatJid.endsWith("@s.whatsapp.net") && !chatJid.endsWith("@g.us")) return false;

    const fromMe = key.fromMe === true;
    const senderJid = normalizeJid(fromMe ? (ownJid || key.participant || "") : (key.participant || chatJid));
    if (!senderJid) return false;

    const now = Date.now();
    trimCache(now);
    ownership.set(`${chatJid}|${key.id}`, { senderJid, cachedAt: now });
    trimCache(now);
    return true;
}

export function getCachedMessageOwner(messageId, chatJid) {
    if (!messageId || !chatJid) return null;
    const key = `${normalizeJid(chatJid)}|${messageId}`;
    const entry = ownership.get(key);
    if (!entry) return null;
    if (Date.now() - entry.cachedAt > TTL_MS) {
        ownership.delete(key);
        return null;
    }
    return entry.senderJid;
}

export function clearMessageOwnershipCache() {
    ownership.clear();
}
