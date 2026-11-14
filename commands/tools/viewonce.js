import { downloadMediaMessage } from "@whiskeysockets/baileys";
import pino from "pino";
import { getCachedConfig } from "../../services/configService.js";
import { BRAND } from "../../brand.js";

const MAX_RECOVERY_BYTES = 32 * 1024 * 1024;

export function unwrapViewOnceMessage(message) {
    let content = message || {};
    let isViewOnce = false;
    for (let i = 0; i < 8; i++) {
        if (content.viewOnceMessage?.message) {
            isViewOnce = true;
            content = content.viewOnceMessage.message;
        } else if (content.viewOnceMessageV2?.message) {
            isViewOnce = true;
            content = content.viewOnceMessageV2.message;
        } else if (content.viewOnceMessageV2Extension?.message) {
            isViewOnce = true;
            content = content.viewOnceMessageV2Extension.message;
        } else if (content.ephemeralMessage?.message) {
            content = content.ephemeralMessage.message;
        } else {
            break;
        }
    }
    return { content, isViewOnce };
}

const normalizeJid = jid => String(jid || "").replace(/:\d+(?=@)/, "");

export const viewonce = async (sock, message) => {
    const prefix = getCachedConfig().prefix || ".";
    const jid = message.key?.remoteJid;
    const context = message.message?.extendedTextMessage?.contextInfo;
    const quoted = context?.quotedMessage;

    if (!quoted) {
        return `👁️ *View Once Recovery*\n\nReply to a View Once photo, video, or voice note that you sent yourself with ${prefix}vv. For privacy, this command cannot reveal someone else's View Once media.`;
    }

    const currentSender = normalizeJid(message.key?.participant || jid);
    const originalSender = normalizeJid(context.participant || jid);
    if (!currentSender || currentSender !== originalSender) {
        return "🔒 For privacy, .vv only works on View Once media sent by the same person running the command. It cannot reveal another person's View Once message.";
    }

    const { content, isViewOnce } = unwrapViewOnceMessage(quoted);
    if (!isViewOnce) return "❌ The quoted message is not a View Once photo, video, or voice note.";

    const mediaType = content.imageMessage ? "image" : content.videoMessage ? "video" : content.audioMessage ? "audio" : null;
    if (!mediaType) return "❌ Supported types are View Once photos, videos, and voice notes.";

    const media = content.imageMessage || content.videoMessage || content.audioMessage;
    const size = Number(media.fileLength || 0);
    if (Number.isFinite(size) && size > MAX_RECOVERY_BYTES) {
        return "❌ This media is larger than the safe 32 MB recovery limit.";
    }

    try {
        const fakeMessage = {
            key: {
                ...message.key,
                id: context.stanzaId || message.key.id,
                participant: context.participant || message.key.participant
            },
            message: quoted
        };
        const buffer = await downloadMediaMessage(fakeMessage, "buffer", {}, {
            logger: pino({ level: "silent" }),
            reuploadRequest: sock.updateMediaMessage
        });
        if (!Buffer.isBuffer(buffer) || buffer.length > MAX_RECOVERY_BYTES) {
            return "❌ This media is unavailable or larger than the safe 32 MB recovery limit.";
        }

        const caption = `👁️ *Your own View Once media*\n\n${BRAND.footer}`;
        if (mediaType === "image") await sock.sendMessage(jid, { image: buffer, caption }, { quoted: message });
        else if (mediaType === "video") await sock.sendMessage(jid, { video: buffer, caption }, { quoted: message });
        else await sock.sendMessage(jid, { audio: buffer, mimetype: media.mimetype || "audio/ogg; codecs=opus", ptt: true }, { quoted: message });
    } catch (error) {
        console.error("[viewonce] Recovery failed:", error.message);
        return "❌ Could not recover that media. It may have expired or WhatsApp may no longer provide it.";
    }
};
