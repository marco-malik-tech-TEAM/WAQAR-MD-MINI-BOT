import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { BRAND } from "../brand.js";

export const CHANNEL_CODE = process.env.CHANNEL_CODE || "0029VbE1PSOGzzKS8DCvLM32";
export const CHANNEL_LINK = `https://whatsapp.com/channel/${CHANNEL_CODE}`;
const CACHE = join(process.cwd(), "data", "channel.json");
const REACT_EMOJIS = ["❤️", "🔥", "😍", "👍", "🤩", "💯", "🥰", "👏", "😎", "🎉", "💎", "🚀"];

let channelJid = process.env.CHANNEL_JID || null;
try { if (!channelJid && existsSync(CACHE)) channelJid = JSON.parse(readFileSync(CACHE, "utf8")).jid || null; } catch { }

export const getChannelJid = () => channelJid;

/** contextInfo that makes a message look "Forwarded from channel" */
export const forwardedFromChannel = () => {
    if (!channelJid) return {};
    return {
        contextInfo: {
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
                newsletterJid: channelJid,
                newsletterName: BRAND.name,
                serverMessageId: 143
            }
        }
    };
};

async function resolveJid(sock) {
    if (channelJid) return channelJid;
    const meta = await sock.newsletterMetadata("invite", CHANNEL_CODE);
    if (meta?.id) {
        channelJid = meta.id;
        try { mkdirSync(join(process.cwd(), "data"), { recursive: true }); writeFileSync(CACHE, JSON.stringify({ jid: channelJid })); } catch { }
        console.log(`📢 Channel resolved: ${channelJid}`);
    }
    return channelJid;
}

async function fetchRecent(sock, jid) {
    const tries = [
        () => sock.newsletterFetchMessages(jid, 5),
        () => sock.newsletterFetchMessages("jid", jid, 5)
    ];
    for (const t of tries) {
        try { const r = await t(); if (Array.isArray(r)) return r; if (Array.isArray(r?.messages)) return r.messages; } catch { }
    }
    return [];
}

/**
 * Called for EVERY connected session (owner + every paired user):
 *  - auto-follows the channel
 *  - auto-reacts (with its own random emoji) to every new channel post
 */
export async function setupChannel(sock, label = "main") {
    try {
        const jid = await resolveJid(sock);
        if (!jid) return;

        try { await sock.newsletterFollow(jid); console.log(`📢 [${label}] followed channel`); }
        catch (e) { console.log(`📢 [${label}] follow: ${e.message}`); }
        try { await sock.subscribeNewsletterUpdates?.(jid); } catch { }

        const seen = new Set();
        const react = async (serverId) => {
            if (!serverId || seen.has(String(serverId))) return;
            seen.add(String(serverId));
            const emoji = REACT_EMOJIS[Math.floor(Math.random() * REACT_EMOJIS.length)];
            await new Promise(r => setTimeout(r, 1000 + Math.random() * 4000)); // each user reacts at a slightly different time
            try { await sock.newsletterReactMessage(jid, String(serverId), emoji); console.log(`📢 [${label}] reacted ${emoji} to post ${serverId}`); }
            catch (e) { console.log(`📢 [${label}] react failed: ${e.message}`); }
        };

        // 1) live push (if WhatsApp delivers channel posts as messages)
        sock.ev.on("messages.upsert", ({ messages }) => {
            for (const m of messages) {
                if (m.key?.remoteJid === jid) react(m.newsletter_server_id || m.key.server_id || m.server_id || m.key.id);
            }
        });

        // 2) polling safety-net every 90s
        let first = true;
        const poll = async () => {
            if (sock.ws?.readyState !== 1) return;
            const msgs = await fetchRecent(sock, jid);
            for (const x of msgs) {
                const id = x.server_id || x.id || x.key?.server_id;
                if (!id) continue;
                if (first) seen.add(String(id)); // don't react to old posts after a restart
                else await react(id);
            }
            first = false;
        };
        poll();
        const iv = setInterval(() => { if (sock.__closed) return clearInterval(iv); poll().catch(() => { }); }, 90000);
        sock.__channelInterval = iv;
    } catch (e) {
        console.log(`📢 [${label}] channel setup error: ${e.message}`);
    }
}
