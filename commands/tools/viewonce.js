import { downloadContentFromMessage, downloadMediaMessage } from "@whiskeysockets/baileys";
import pino from "pino";
import { getCachedConfig } from "../../services/configService.js";
import { getCachedMessageOwner } from "../../services/messageOwnershipCache.js";
import { BRAND } from "../../brand.js";
import { unwrapViewOnceMessage } from "../../utils/viewOnce.js";

export { unwrapViewOnceMessage } from "../../utils/viewOnce.js";

const MAX_RECOVERY_BYTES = 32 * 1024 * 1024;
const normalizeJid = jid => String(jid || "").replace(/:\d+(?=@)/, "");

function getCommandContext(message) {
    let content = message?.message || {};
    for (let depth = 0; depth < 10; depth++) {
        const context = content.extendedTextMessage?.contextInfo
            || content.imageMessage?.contextInfo
            || content.videoMessage?.contextInfo
            || content.audioMessage?.contextInfo;
        if (context) return context;
        const inner = content.ephemeralMessage?.message || content.documentWithCaptionMessage?.message;
        if (!inner) break;
        content = inner;
    }
    return null;
}

async function streamToBuffer(stream) {
    const chunks = [];
    let total = 0;
    for await (const chunk of stream) {
        const part = Buffer.from(chunk);
        total += part.length;
        if (total > MAX_RECOVERY_BYTES) throw new Error("View Once media exceeds the 32 MB recovery limit.");
        chunks.push(part);
    }
    return Buffer.concat(chunks, total);
}

async function downloadQuotedMedia(sock, media, mediaType, fakeMessage) {
    let directError;
    try {
        const stream = await downloadContentFromMessage(media, mediaType);
        const buffer = await streamToBuffer(stream);
        if (buffer.length) return buffer;
        directError = new Error("WhatsApp returned an empty media stream.");
    } catch (error) {
        directError = error;
    }

    // Older/expired media URLs may need Baileys' re-upload callback; never cache the media ourselves.
    try {
        const downloadOptions = { logger: pino({ level: "silent" }) };
        if (typeof sock.updateMediaMessage === "function") {
            downloadOptions.reuploadRequest = sock.updateMediaMessage.bind(sock);
        }
        const buffer = await downloadMediaMessage(fakeMessage, "buffer", {}, downloadOptions);
        if (Buffer.isBuffer(buffer) && buffer.length) return buffer;
    } catch {
        // Preserve one friendly user-facing failure below rather than leaking transport details.
    }
    throw directError || new Error("WhatsApp could not provide the quoted media.");
}

export async function recoverViewOnce(sock, message, { download = downloadQuotedMedia } = {}) {
    const prefix = getCachedConfig().prefix || ".";
    const jid = message?.key?.remoteJid;
    const context = getCommandContext(message);
    const quoted = context?.quotedMessage;

    if (!quoted) {
        return `👁️ *View Once Recovery*\n\nReply to your own View Once photo, video, or voice note with ${prefix}vv. For privacy, this command cannot reveal anyone else's View Once media.`;
    }
    if (!jid) return "❌ Could not identify the chat for this recovery request.";

    const { content, isViewOnce, mediaType, media } = unwrapViewOnceMessage(quoted);
    if (!isViewOnce) return "❌ The quoted message is not a View Once photo, video, or voice note.";
    if (!mediaType || !media) return "❌ Supported types are View Once photos, videos, and voice notes.";

    // Group quotes identify the original participant directly. For direct chats, use the
    // short-lived ID/JID-only ownership cache; raw View Once content is never cached.
    const originalSender = normalizeJid(context.participant)
        || normalizeJid(getCachedMessageOwner(context.stanzaId, jid));
    const currentSender = normalizeJid(message.key?.fromMe ? sock?.user?.id : (message.key?.participant || jid));
    if (!originalSender || !currentSender || currentSender !== originalSender) {
        return "🔒 For privacy, .vv only recovers your own View Once media; it cannot reveal another person's View Once message. The sender could not be verified, or the quote belongs to someone else.";
    }

    const advertisedSize = Number(media.fileLength || 0);
    if (Number.isFinite(advertisedSize) && advertisedSize > MAX_RECOVERY_BYTES) {
        return "❌ This media is larger than the safe 32 MB recovery limit.";
    }

    const fakeMessage = {
        key: {
            remoteJid: jid,
            id: context.stanzaId || message.key.id,
            participant: originalSender,
            fromMe: originalSender === normalizeJid(sock?.user?.id)
        },
        message: quoted
    };

    try {
        const buffer = await download(sock, media, mediaType, fakeMessage);
        if (!Buffer.isBuffer(buffer) || !buffer.length || buffer.length > MAX_RECOVERY_BYTES) {
            return "❌ This media is unavailable, empty, or larger than the safe 32 MB recovery limit.";
        }

        const caption = `👁️ *Your own View Once media*\n\n${BRAND.footer}`;
        if (mediaType === "image") await sock.sendMessage(jid, { image: buffer, caption }, { quoted: message });
        else if (mediaType === "video") await sock.sendMessage(jid, { video: buffer, caption }, { quoted: message });
        else await sock.sendMessage(jid, { audio: buffer, mimetype: media.mimetype || "audio/ogg; codecs=opus", ptt: Boolean(media.ptt) }, { quoted: message });
    } catch (error) {
        console.error("[viewonce] Recovery failed:", error.message);
        return /32 MB/i.test(error.message)
            ? "❌ This media is larger than the safe 32 MB recovery limit."
            : "❌ Could not recover that media. It may have expired or WhatsApp may no longer provide it.";
    }
}

export const viewonce = async (sock, message) => recoverViewOnce(sock, message);
