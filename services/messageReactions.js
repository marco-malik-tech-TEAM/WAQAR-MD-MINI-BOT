const reacted = new Map();
const REACTION_EMOJI = "👍";
const DEDUPE_TTL_MS = 10 * 60 * 1000;

export function shouldAutoReact(message, enabled) {
    const jid = message?.key?.remoteJid;
    if (!enabled || !jid || !message?.message || message.key.fromMe) return false;
    if (jid === "status@broadcast" || jid.endsWith("@broadcast") || jid.endsWith("@newsletter")) return false;
    if (message.message.protocolMessage || message.message.reactionMessage || message.message.pollUpdateMessage) return false;
    return Boolean(message.key.id);
}

export async function reactToIncomingMessage(sock, message, enabled) {
    if (!shouldAutoReact(message, enabled)) return false;
    const key = `${message.key.remoteJid}:${message.key.id}`;
    const now = Date.now();
    for (const [seenKey, timestamp] of reacted) {
        if (now - timestamp > DEDUPE_TTL_MS) reacted.delete(seenKey);
    }
    if (reacted.has(key)) return false;

    reacted.set(key, now);
    try {
        await sock.sendMessage(message.key.remoteJid, { react: { text: REACTION_EMOJI, key: message.key } });
        return true;
    } catch (error) {
        reacted.delete(key);
        throw error;
    }
}
