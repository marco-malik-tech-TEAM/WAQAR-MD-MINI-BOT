import axios from "axios";
import { makeWelcomeCard } from "./welcomeCard.js";
import { loadGroupSettings, saveGroupSettings } from "./groupSettingsService.js";
import { isAdmin, isBotAdmin, getGroupMetadata } from "../utils/groupUtils.js";
import { getCachedConfig } from "./configService.js";

/**
 * Handle Group Participants Update (Welcome/Goodbye)
 */
export async function handleGroupParticipantsUpdate(sock, update) {
    const { id, participants, action } = update;

    // Only handle add/remove
    if (action !== "add" && action !== "remove") return;

    // Keep original participant metadata when a Baileys version includes it alongside the JID.
    const participantEvents = (participants || []).map(raw => ({
        raw,
        jid: typeof raw === "string" ? raw : (raw?.id || raw?.jid || (raw?.phoneNumber ? `${String(raw.phoneNumber).replace(/\D/g, "")}@s.whatsapp.net` : ""))
    })).filter(x => x.jid);

    console.log(`👥 [GroupEvent] Participants update: action=${action}, group=${id}, participants=${participantEvents.map(x => x.jid).join(", ")}`);

    try {
        const settings = loadGroupSettings(id);
        console.log(`📋 [GroupEvent] Settings loaded: welcome.enabled=${settings.welcome?.enabled}, goodbye.enabled=${settings.goodbye?.enabled}`);

        const metadata = await getGroupMetadata(sock, id);
        if (!metadata) {
            console.error(`❌ [GroupEvent] Failed to get group metadata for ${id}`);
            return;
        }

        const groupName = metadata?.subject || "Group";
        const desc = metadata?.desc?.toString() || "";

        for (const entry of participantEvents) {
            const participant = entry.jid;
            const raw = typeof entry.raw === "object" ? entry.raw : {};
            const member = (metadata.participants || []).find(x =>
                [x.id, x.lid, x.phoneNumber].filter(Boolean).some(value => String(value).split(":")[0] === participant.split(":")[0])
            ) || {};
            const displayName = String(raw.name || raw.notify || raw.notifyName || raw.pushName || member.name || member.notify || member.verifiedName || "New member").trim().slice(0, 80);
            const phoneValue = raw.phoneNumber || raw.phone || member.phoneNumber || (participant.endsWith("@s.whatsapp.net") ? participant.split("@")[0] : "");
            const number = String(phoneValue).replace(/\D/g, "");
            let messageText = "";
            let isWelcome = false;

            if (action === "add" && settings.welcome?.enabled) {
                messageText = settings.welcome.message || "";
                isWelcome = true;
                console.log(`✅ [GroupEvent] Welcome is enabled, preparing message for ${participant}`);
            } else if (action === "remove" && settings.goodbye?.enabled) {
                messageText = settings.goodbye.message || "";
                console.log(`✅ [GroupEvent] Goodbye is enabled, preparing message for ${participant}`);
            } else {
                console.log(`ℹ️ [GroupEvent] ${action === "add" ? "Welcome" : "Goodbye"} is disabled for group ${id}`);
            }

            if (messageText) {
                // Replace placeholders
                const user = `@${participant.split("@")[0]}`;
                const count = metadata?.participants?.length || "?";

                messageText = messageText
                    .replace(/{group}/g, groupName)
                    .replace(/{desc}/g, desc)
                    .replace(/{count}/g, count)
                    .replace(/{name}/g, displayName)
                    .replace(/{number}/g, number || "Not provided by WhatsApp")
                    .replace(/@user/g, user);

                let avatar = null;
                try {
                    if (typeof sock.profilePictureUrl === "function") {
                        const avatarUrl = await sock.profilePictureUrl(participant, "image");
                        const parsedAvatarUrl = new URL(avatarUrl);
                        if (parsedAvatarUrl.protocol !== "https:" || !(parsedAvatarUrl.hostname === "whatsapp.net" || parsedAvatarUrl.hostname.endsWith(".whatsapp.net"))) {
                            throw new Error("Profile image URL is not on a WhatsApp domain.");
                        }
                        const response = await axios.get(avatarUrl, { responseType: "arraybuffer", timeout: 8000, maxContentLength: 2 * 1024 * 1024, maxRedirects: 0 });
                        if (String(response.headers["content-type"] || "").startsWith("image/")) avatar = Buffer.from(response.data);
                    }
                } catch { /* profile images may be hidden by the member's privacy settings */ }

                // Send message (with a generated welcome card image when possible)
                const card = await makeWelcomeCard({ groupName, name: displayName, number, avatar, count: metadata?.participants?.length || 0, kind: isWelcome ? "welcome" : "goodbye" });
                if (card) {
                    await sock.sendMessage(id, { image: card, caption: messageText, mentions: [participant] });
                } else {
                    await sock.sendMessage(id, { text: messageText, mentions: [participant] });
                }
                console.log(`📢 Sent ${isWelcome ? 'Welcome' : 'Goodbye'} message to ${id}`);
            }
        }
    } catch (err) {
        console.error("Error handling group participants update:", err.message);
    }
}

/**
 * Handle Group Messages (Antilink, Antispam)
 */
export async function handleGroupMessage(sock, m) {
    if (!m.message) return false;

    const remoteJid = m.key.remoteJid;
    if (!remoteJid.endsWith("@g.us")) return false;

    // Skip bot's own messages - check both fromMe flag and JID comparison
    if (m.key.fromMe) return false;
    const sender = m.key.participant || m.key.remoteJid;
    const botJid = (sock.user?.id?.split("@")[0]?.split(":")[0]) + "@s.whatsapp.net";
    if (sender.split(":")[0].split("@")[0] === botJid.split("@")[0]) return false;

    const settings = loadGroupSettings(remoteJid);

    // Check if bot is disabled for this group
    if (settings.botEnabled === false) {
        const config = getCachedConfig();
        const p = config.prefix || "!";
        const msgText = (m.message.conversation || m.message.extendedTextMessage?.text || "").toLowerCase().trim();

        // Only allow !bot on to pass through
        if (msgText === `${p}bot on`) {
            return false;
        }
        return true; // Return true to "consume" the message and stop further processing in whatsappClient.js
    }

    // 1. Antilink Check
    if (settings.antilink?.enabled) {
        const msgText = (
            m.message.conversation ||
            m.message.extendedTextMessage?.text ||
            m.message.imageMessage?.caption ||
            m.message.videoMessage?.caption ||
            ""
        ).toLowerCase();

        // Detect any URL using regex
        const urlRegex = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/i;
        const hasUrl = urlRegex.test(msgText);

        if (hasUrl) {
            // Whitelist check: Skip antilink for official domains
            const whitelist = [
                "marco-waqar-mini-bot-info-web.vercel.app",
                "wa.me/923377857866",
                "wa.me/923293245445"
            ];

            const isWhitelisted = whitelist.some(domain => msgText.includes(domain));
            if (isWhitelisted) {
                console.log(`🛡️ [Antilink] Skipping whitelisted link in ${remoteJid}`);
                return false;
            }

            // Check if sender is admin (exempt)
            const senderIsAdmin = await isAdmin(sock, remoteJid, sender);

            if (!senderIsAdmin) {
                console.log(`🛡️ Antilink triggered for ${sender} in ${remoteJid}`);

                // Check if bot is admin before trying to delete/kick
                const botIsAdmin = await isBotAdmin(sock, remoteJid);
                if (!botIsAdmin) {
                    await sock.sendMessage(remoteJid, {
                        text: `🚫 *Link Detected!* I need admin privileges to manage antilink.`
                    });
                    return true;
                }

                // Delete message
                await sock.sendMessage(remoteJid, { delete: m.key });

                // Check action
                if (settings.antilink.action === "kick") {
                    await sock.groupParticipantsUpdate(remoteJid, [sender], "remove");
                    await sock.sendMessage(remoteJid, {
                        text: `🚫 *Link Detected!* @${sender.split("@")[0]} has been kicked for sharing links.`,
                        mentions: [sender]
                    });
                } else {
                    // Warn/Delete mode (default)
                    await sock.sendMessage(remoteJid, {
                        text: `⚠️ @${sender.split("@")[0]}, *links are not allowed* in this group! Your message has been deleted.`,
                        mentions: [sender]
                    });
                }
                return true; // Stop processing command/other things
            }
        }
    }

    // 2. Antispam (basic placeholder for now)
    // if (settings.antispam?.enabled) { ... }

    return false; // Continue processing
}
