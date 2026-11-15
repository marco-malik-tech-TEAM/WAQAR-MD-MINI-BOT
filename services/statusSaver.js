import { downloadMediaMessage } from "@whiskeysockets/baileys";
import pino from "pino";
import { BRAND } from "../brand.js";
import { getCachedConfig } from "./configService.js";

const statusCache = new Map(); // status message id -> { message, cachedAt }
const MAX_CACHE = 400;
const STATUS_TTL = 24 * 60 * 60 * 1000;
const MAX_STATUS_MEDIA = 32 * 1024 * 1024;
const repliedStatusMessages = new Map();

function unwrap(message) {
    let current = message || {};
    for (let depth = 0; depth < 6; depth++) {
        const inner = current.ephemeralMessage?.message
            || current.documentWithCaptionMessage?.message
            || current.viewOnceMessage?.message
            || current.viewOnceMessageV2?.message
            || current.viewOnceMessageV2Extension?.message;
        if (!inner) break;
        current = inner;
    }
    return current;
}

function isViewOnce(message) {
    let current = message || {};
    for (let depth = 0; depth < 6; depth++) {
        if (current.viewOnceMessage || current.viewOnceMessageV2 || current.viewOnceMessageV2Extension) return true;
        const inner = current.ephemeralMessage?.message || current.documentWithCaptionMessage?.message;
        if (!inner) return false;
        current = inner;
    }
    return false;
}

function ownJid(sock) {
    const id = sock?.user?.id || "";
    const number = id.split(":")[0].split("@")[0].replace(/\D/g, "");
    return number ? `${number}@s.whatsapp.net` : "";
}

function statusContext(message) {
    const candidates = [
        message?.message?.extendedTextMessage?.contextInfo,
        message?.message?.imageMessage?.contextInfo,
        message?.message?.videoMessage?.contextInfo,
        message?.message?.audioMessage?.contextInfo,
        message?.message?.documentMessage?.contextInfo
    ];
    return candidates.find(context => context?.remoteJid === "status@broadcast" && context?.stanzaId) || null;
}

/** Cache only statuses delivered to the connected account while it is online. */
export function cacheStatus(message) {
    if (message?.key?.remoteJid !== "status@broadcast" || message.key.fromMe || !message.key.id || !message.message) return false;
    if (message.message.protocolMessage || message.message.reactionMessage || isViewOnce(message.message)) return false;
    const now = Date.now();
    for (const [id, entry] of statusCache) if (now - entry.cachedAt > STATUS_TTL) statusCache.delete(id);
    statusCache.set(message.key.id, { message, cachedAt: now });
    while (statusCache.size > MAX_CACHE) statusCache.delete(statusCache.keys().next().value);
    return true;
}

/** Save one previously received ordinary status to the linked account's own private chat. */
export async function saveCachedStatus(sock, statusId) {
    const entry = statusCache.get(statusId);
    const me = ownJid(sock);
    if (!me) return "❌ WhatsApp session is not ready. Reconnect the linked account and try again.";
    if (!entry) return "⚠️ That status is not in the bot's recent cache. The bot must be online when it is delivered; status media expires after 24 hours.";
    if (Date.now() - entry.cachedAt > STATUS_TTL) {
        statusCache.delete(statusId);
        return "⚠️ This status has expired from the local cache. View a current status and try again.";
    }

    const original = entry.message;
    if (isViewOnce(original.message)) return "🔒 View Once content is never saved by the status downloader.";
    const content = unwrap(original.message);
    const sender = (original.key.participant || original.participant || "").split("@")[0];
    const heading = `💾 *Status saved${sender ? ` (from +${sender})` : ""}*`;
    const caption = type => `${content[type]?.caption ? `${content[type].caption}\n\n` : ""}${heading}\n\n${BRAND.footer}`;

    try {
        if (content.imageMessage || content.videoMessage || content.audioMessage) {
            const media = content.imageMessage || content.videoMessage || content.audioMessage;
            const advertisedSize = Number(media.fileLength || 0);
            if (advertisedSize > MAX_STATUS_MEDIA) return "⚠️ This status media is over the 32 MB recovery limit.";
            const downloadContext = { logger: pino({ level: "silent" }) };
            if (typeof sock.updateMediaMessage === "function") downloadContext.reuploadRequest = sock.updateMediaMessage.bind(sock);
            const buffer = await downloadMediaMessage(original, "buffer", {}, downloadContext);
            if (!Buffer.isBuffer(buffer) || !buffer.length) return "❌ WhatsApp returned an empty status-media file. Try again while the status is still available.";
            if (buffer.length > MAX_STATUS_MEDIA) return "⚠️ This status media is over the 32 MB recovery limit.";
            if (content.imageMessage) await sock.sendMessage(me, { image: buffer, caption: caption("imageMessage") });
            else if (content.videoMessage) await sock.sendMessage(me, { video: buffer, caption: caption("videoMessage") });
            else {
                await sock.sendMessage(me, { audio: buffer, mimetype: content.audioMessage.mimetype || "audio/ogg; codecs=opus", ptt: Boolean(content.audioMessage.ptt) });
                await sock.sendMessage(me, { text: `${heading}\n\n${BRAND.footer}` });
            }
        } else {
            const text = content.conversation || content.extendedTextMessage?.text || content.buttonsMessage?.contentText;
            if (!text) return "⚠️ This status type is not supported. Supported types are text, photo, video, and audio.";
            await sock.sendMessage(me, { text: `${text}\n\n${heading}\n\n${BRAND.footer}` });
        }
        return "✅ Status saved to the linked WhatsApp account's private chat.";
    } catch (error) {
        console.error("[StatusSaver] Failed to save status:", error.message);
        return "❌ Status download failed. The status may have expired or WhatsApp may have removed its media key. View a fresh status, then retry.";
    }
}

/** Save after the owner reacts to a status or replies to it. */
export async function handleStatusSave(sock, message) {
    if (!message?.message || !message.key?.fromMe) return false;
    let statusId = null;
    const reaction = message.message.reactionMessage;
    if (reaction?.key?.remoteJid === "status@broadcast" && reaction.key.id) statusId = reaction.key.id;
    const context = statusContext(message);
    if (!statusId && context) statusId = context.stanzaId;
    if (!statusId) return false;

    const result = await saveCachedStatus(sock, statusId);
    if (!result.startsWith("✅")) {
        await sock.sendMessage(ownJid(sock), { text: result }).catch(() => {});
    }
    return true;
}

/** Explicit `.savestatus`/`.statusdl` command: it must be a reply to a status. */
export async function saveRepliedStatus(sock, message) {
    const context = statusContext(message);
    if (!context) return "Reply to a viewed WhatsApp status with .savestatus (or .statusdl). The bot must have received it while online.";
    return saveCachedStatus(sock, context.stanzaId);
}

/** Optional response to inbound direct messages that explicitly reply to the linked account's status. */
export async function handleStatusAutoReply(sock, message) {
    if (!message?.message || message.key?.fromMe || message.key?.remoteJid === "status@broadcast") return;
    const config = getCachedConfig();
    if (!config.statusReplyEnabled || !String(config.statusReplyText || "").trim()) return;
    const context = statusContext(message);
    if (!context || !message.key?.remoteJid || message.key.remoteJid.endsWith("@g.us")) return;
    const statusOwner = context.participant || context.participantPn;
    const ownIds = [sock?.user?.id, sock?.user?.lid].filter(Boolean).map(id => id.split(":")[0].split("@")[0]);
    if (!statusOwner || !ownIds.includes(statusOwner.split(":")[0].split("@")[0])) return;
    const identity = `${message.key.remoteJid}:${context.stanzaId}`;
    if (repliedStatusMessages.has(identity)) return;
    repliedStatusMessages.set(identity, Date.now());
    while (repliedStatusMessages.size > 500) repliedStatusMessages.delete(repliedStatusMessages.keys().next().value);
    const displayName = String(message.pushName || "there").slice(0, 80);
    const response = String(config.statusReplyText).slice(0, 500).replaceAll("{{name}}", displayName);
    await sock.sendMessage(message.key.remoteJid, { text: response });
}
