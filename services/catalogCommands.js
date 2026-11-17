import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { isIP } from "node:net";
import axios from "axios";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { getCachedConfig, updateConfig, invalidateConfigCache } from "./configService.js";
import { loadGroupSettings, saveGroupSettings } from "./groupSettingsService.js";
import { isAdmin, isBotAdmin } from "../utils/groupUtils.js";
import { OWNER_NUMBERS, BRAND } from "../brand.js";
import { video } from "../commands/media/video.js";
import { movie } from "../commands/media/movie.js";
import { instagram } from "../commands/media/social.js";
import { generateAIResponse } from "./aiProvider.js";
import { saveRepliedStatus } from "./statusSaver.js";

const STORE_DIR = join(process.cwd(), "data");
const ECONOMY_FILE = join(STORE_DIR, "menu-economy.json");
const ACTIVITY_FILE = join(STORE_DIR, "menu-activity.json");
const MAX_MEDIA = 8 * 1024 * 1024;
const NAME = "catalog command";
const afkNoticeCooldown = new Map();
const pick = list => list[Math.floor(Math.random() * list.length)];
const jidOf = m => m?.key?.participant || m?.key?.remoteJid || "";
const bare = jid => String(jid || "").split(":")[0].split("@")[0];
const chatOf = m => m?.key?.remoteJid || "";
const prefix = () => getCachedConfig().prefix || ".";
const isGroup = m => chatOf(m).endsWith("@g.us");
const mention = m => m?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || m?.message?.extendedTextMessage?.contextInfo?.participant || jidOf(m);

function readJson(path, fallback) {
    try { return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : fallback; }
    catch (error) { console.warn(`[${NAME}] Could not read ${path}:`, error.message); return fallback; }
}
function writeJson(path, data) {
    try { mkdirSync(STORE_DIR, { recursive: true }); writeFileSync(path, JSON.stringify(data, null, 2), { mode: 0o600 }); return true; }
    catch (error) { console.error(`[${NAME}] Could not save ${path}:`, error.message); return false; }
}
function isOwner(m) {
    const config = getCachedConfig();
    const number = bare(jidOf(m));
    return Boolean(m?.key?.fromMe || number === String(config.ownerNumber || "").replace(/\D/g, "") || OWNER_NUMBERS.includes(number));
}
async function adminCheck(sock, m) {
    if (!isGroup(m)) return "This command only works in a group.";
    if (!await isAdmin(sock, chatOf(m), jidOf(m))) return "Only a group admin can use this command.";
    return "";
}
async function mediaBuffer(m) {
    const context = m?.message?.extendedTextMessage?.contextInfo;
    let quotedMessage = context?.quotedMessage;
    if (!quotedMessage) return null;
    for (let depth = 0; depth < 4 && quotedMessage; depth++) {
        if (quotedMessage.viewOnceMessage || quotedMessage.viewOnceMessageV2 || quotedMessage.viewOnceMessageV2Extension) {
            throw new Error("View Once media is not available through this command. Use .vv only for your own message.");
        }
        if (quotedMessage.ephemeralMessage?.message) { quotedMessage = quotedMessage.ephemeralMessage.message; continue; }
        break;
    }
    const key = { remoteJid: chatOf(m), id: context.stanzaId, participant: context.participant, fromMe: false };
    const quoted = { key, message: quotedMessage };
    const buffer = await downloadMediaMessage(quoted, "buffer", {}, {});
    return Buffer.isBuffer(buffer) && buffer.length <= MAX_MEDIA ? buffer : null;
}
function canvasCard(title, body, color = "#1d4ed8") {
    const canvas = createCanvas(900, 500);
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 900, 500);
    gradient.addColorStop(0, "#0f172a"); gradient.addColorStop(1, color);
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 900, 500);
    ctx.fillStyle = "rgba(255,255,255,.08)"; ctx.fillRect(44, 44, 812, 412);
    ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "bold 54px sans-serif";
    ctx.fillText(String(title).slice(0, 32), 450, 180, 760);
    ctx.font = "32px sans-serif"; const words = String(body).slice(0, 150).split(/\s+/); let line = "", y = 255;
    for (const word of words) { const test = line ? `${line} ${word}` : word; if (ctx.measureText(test).width > 740) { ctx.fillText(line, 450, y); line = word; y += 46; } else line = test; }
    if (line && y < 420) ctx.fillText(line, 450, y);
    ctx.font = "20px sans-serif"; ctx.fillStyle = "#cbd5e1"; ctx.fillText(BRAND.name, 450, 420);
    return canvas.toBuffer("image/png");
}
function funReply(command, args, m) {
    const target = args.join(" ").trim() || `@${bare(mention(m))}`;
    const percentages = ["12", "27", "43", "58", "71", "84", "96"];
    const simple = {
        gayrate: `🏳️‍🌈 Fun rating for ${target}: ${pick(percentages)}% (just a joke; no assumptions about anyone).`,
        iqrate: `🧠 ${target}'s quiz-energy today: ${pick(percentages)}% — for fun only.`,
        rizzrate: `✨ Rizz score for ${target}: ${pick(percentages)}% (totally random).`,
        simprate: `💖 Friendship-energy score for ${target}: ${pick(percentages)}%.`,
        toxicrate: `🌱 Kindness meter for ${target}: ${pick(percentages)}% — take it lightly.`,
        howgay: `🏳️‍🌈 Identity is personal and cannot be measured by a bot. Try .rate for a harmless random score.`,
        howdumb: `🧠 Nobody's intelligence can be measured by a chat command. Let's keep it kind.`,
        compliment: `🌟 ${target}, you bring a good energy to the people around you.`,
        insult: `😄 Friendly roast for ${target}: your Wi-Fi has more commitment than your plans. Just a joke!`,
        flirt: `💬 Are you a notification? You just made this chat a little more interesting.`,
        jail: `🔒 ${target} has been sentenced to one minute of good vibes. (Role-play only.)`,
        wanted: `📜 WANTED: ${target} — for stealing all the snacks. (Fictional fun only.)`,
        pies: `🥧 A pretend pie gently lands near ${target}. No real-world action.`,
        bestie: `🤝 ${target} has been nominated as today's bestie!`,
        soulmate: `💞 ${target} gets a fictional soulmate badge today.`,
        enemy: `🤺 ${target} is your friendly rival in a completely imaginary story.`,
        marry: `💍 A pretend friendship badge is awarded to ${target}; this is not a real marriage.`,
        divorce: `📄 The imaginary sitcom duo has agreed to share the remote.`,
        vs: `⚔️ ${target} vs. the group: friendly match, no real stakes!`,
        babyname: `👶 Name idea: ${pick(["Ayaan", "Noor", "Mira", "Rayyan", "Lina", "Zayn"])}.`,
        fortune: `🔮 ${pick(["A kind message will brighten your day.", "A small plan will turn into a good memory.", "Take a break and drink some water.", "Your next idea deserves a try."])} (for entertainment only)`,
        horoscope: `✨ Horoscope-style note: focus on one small goal today, and make time to rest. For entertainment only.`,
        mood: `🌤️ Mood check: ${pick(["calm", "curious", "hopeful", "playful", "focused"])}.`,
        profession: `🧭 Today's imaginary profession: ${pick(["planet explorer", "tea critic", "cloud architect", "puzzle designer"])}.`,
        character: `🎭 Your chat character today: ${pick(["The Helpful Planner", "The Curious Explorer", "The Calm Strategist", "The Friendly Comedian"])}.`,
        fact: `💡 ${pick(["Honey never spoils when stored properly.", "Octopuses have three hearts.", "A day on Venus is longer than its year.", "Bananas are berries in botanical terms."])} `,
        quote: `“${pick(["Small steps still move you forward.", "Kindness is a strength that travels.", "Curiosity turns obstacles into questions.", "Rest is part of progress."])}”`,
        choose: `🎯 I choose: ${pick(args.length ? args.join(" ").split(/[|,]/).map(x => x.trim()).filter(Boolean) : ["option A", "option B"])}.`,
        slap: `🖐️ A gentle, imaginary high-five for ${target}.`, kiss: `💋 A virtual friendly kiss sent to ${target} — use only if welcome.`, hug: `🤗 A virtual hug for ${target} — only if welcome.`,
        pat: `🫳 A gentle, virtual pat for ${target}.`, cuddle: `🧸 A cozy fictional cuddle for ${target} — only if welcome.`, poke: `👉 A light, imaginary poke for ${target}.`, bite: `🧛 A pretend cartoon nibble for ${target}.`,
        bonk: `🪄 A soft cartoon bonk with a foam mallet for ${target}.`, punch: `🥊 A pretend pillow-punch sound effect for ${target}; no real violence.`, yeet: `🚀 ${target} is gently yeeted into a pile of pillows (cartoon only).`,
        highfive: `🙌 High-five, ${target}!`, handhold: `🤝 A friendly virtual handhold for ${target}.`, tickle: `🪶 A pretend feather tickle for ${target} — stop if unwelcome.`, feed: `🍪 A virtual cookie for ${target}.`, wave: `👋 ${target}, sending a friendly wave!`,
        mentionking: `👑 Mention leaderboard needs stored activity data; it is not collected by this bot yet.`, stickerking: `🏆 Sticker leaderboard needs message-history tracking, which is not enabled for privacy.`, weeklymvp: `🌟 Weekly MVP is not calculated because the bot does not archive chat activity.`, roastoftheday: `🔥 Friendly roast of the day: my calendar needs a calendar to keep track of itself.`,
        mostactive: `🔒 Activity rankings are unavailable because the bot does not archive group chat history.`, mostquiet: `🔒 Activity rankings are unavailable because the bot does not archive group chat history.`, nightowl: `🔒 Night-owl rankings are unavailable because the bot does not archive chat timestamps.`,
        story: `📖 ${pick(["At sunrise, a small blue kite escaped its string and found a new home in a tree. Its owner smiled, knowing the wind had written a better ending.", "A tiny lighthouse blinked through the fog each night. One evening, a lost boat answered with a warm golden light, and the sea grew quiet again.", "Mina found a map inside an old book. It led not to treasure, but to a bench where her future best friend was waiting."])}`,
        wyr: `🤔 Would you rather: ${pick(["explore the ocean or outer space?", "always be early or always have snacks?", "read minds or speak every language?"])}`,
        nhie: `🙋 Never have I ever: ${pick(["forgotten why I opened an app", "laughed at my own joke", "started a hobby and bought all the gear first"])}`,
        pick: `🎲 Random pick: ${pick(args.length ? args.join(" ").split(/[|,]/).map(x => x.trim()).filter(Boolean) : ["A", "B"])}.`,
        caption: `📝 Caption idea: “${pick(["A little moment, a lot of meaning.", "Collecting good days.", "Somewhere between plans and memories.", "Keep it simple, keep it kind."])}”`
    };
    if (simple[command]) return simple[command];
    const interactions = { cuddle: "cozy blanket", poke: "boop", bite: "cartoon nibble", bonk: "foam mallet tap", feed: "snack", wave: "friendly wave", pat: "gentle pat", handhold: "friendly handhold", yeet: "pillow launch", slap: "soft high-five", kiss: "friendly greeting", hug: "virtual hug", punch: "pillow tap", tickle: "feather tickle" };
    if (interactions[command]) return `🎭 ${target} gets a harmless pretend ${interactions[command]} — stop if anyone is uncomfortable.`;
    return null;
}

async function economy(command, args, m) {
    const all = readJson(ECONOMY_FILE, {});
    const user = bare(jidOf(m));
    if (!user) return "Could not identify the sender.";
    const now = Date.now();
    const data = all[user] || { coins: 0, xp: 0, dailyAt: 0, weeklyAt: 0, inventory: [], role: "Newcomer" };
    const save = () => { all[user] = data; writeJson(ECONOMY_FILE, all); };
    if (["daily", "weekly", "work", "crime", "mine", "fish", "hunt", "chop", "forage"].includes(command)) {
        const key = command === "daily" ? "dailyAt" : command === "weekly" ? "weeklyAt" : "workAt";
        const cooldown = command === "daily" ? 86400000 : command === "weekly" ? 604800000 : 30000;
        if (now - (data[key] || 0) < cooldown) return `⏳ You can use .${command} again after the cooldown.`;
        const amount = command === "daily" ? 100 : command === "weekly" ? 500 : 10 + Math.floor(Math.random() * 31);
        data[key] = now; data.coins += amount; data.xp += 10; save();
        return `✅ ${command[0].toUpperCase() + command.slice(1)} complete: +${amount} coins and +10 XP. Balance: ${data.coins}.`;
    }
    if (["balance", "economy"].includes(command)) return `💰 Balance: ${data.coins} coins\n⭐ XP: ${data.xp}\n🎒 Items: ${data.inventory.length}\n🎖️ Role: ${data.role}`;
    if (command === "topcoins") return `🏆 Top coins are not shown because the bot stores only your own local balance and does not publish a global leaderboard.`;
    if (["dep", "wd", "pay"].includes(command)) {
        const amount = Number(args[0]);
        if (!Number.isSafeInteger(amount) || amount < 1 || amount > 1000000) return `Usage: ${prefix()}${command} <amount> (1–1,000,000)`;
        if (command === "dep") { data.bank = (data.bank || 0) + Math.min(amount, data.coins); data.coins -= Math.min(amount, data.coins); }
        else if (command === "wd") { const take = Math.min(amount, data.bank || 0); data.bank = (data.bank || 0) - take; data.coins += take; }
        else return "Coin transfers to other users are disabled until secure recipient confirmation is available.";
        save(); return `✅ Updated wallet. Wallet: ${data.coins}; bank: ${data.bank || 0}.`;
    }
    if (command === "shop") return "🛍️ Shop: 🎣 Fishing Rod — 50 coins; 🧭 Compass — 75 coins; 🧰 Tool Kit — 100 coins. Use .buy <item>.";
    if (command === "buy") {
        const item = args.join(" ").toLowerCase(); const prices = { "fishing rod": 50, compass: 75, "tool kit": 100 };
        if (!prices[item]) return "Available: fishing rod, compass, tool kit.";
        if (data.coins < prices[item]) return "Not enough coins.";
        data.coins -= prices[item]; data.inventory.push(item); save(); return `✅ Purchased ${item}.`;
    }
    if (command === "levelup") { const cost = Math.max(50, (data.level || 1) * 50); if (data.coins < cost) return `Need ${cost} coins to level up.`; data.coins -= cost; data.level = (data.level || 1) + 1; save(); return `⭐ Level up! You are now level ${data.level}.`; }
    if (command === "role") return `🎖️ Your role is ${data.role}. Roles are cosmetic and have no real-world status.`;
    if (command === "autolevelup") return "ℹ️ Automatic level-up is disabled to keep balances predictable; use .levelup when you choose.";
    return null;
}

async function groupModeration(command, sock, m, args) {
    const checked = await adminCheck(sock, m);
    if (checked) return checked;
    const chat = chatOf(m); const settings = loadGroupSettings(chat);
    if (command === "antibot") return "WhatsApp does not expose reliable bot-account identification to this bot, so antibot enforcement is unavailable and has not been enabled.";
    if (command === "antibadword" && String(args[0] || "").toLowerCase() === "words") {
        const words = args.slice(1).join(" ").split(",").map(word => word.trim().toLowerCase()).filter(word => /^[\p{L}\p{N}_-]{2,40}$/u.test(word)).slice(0, 30);
        if (!words.length) return `Usage: ${prefix()}antibadword words word1,word2`;
        settings.features ||= {}; settings.features.blockedWords = [...new Set(words)]; settings.features.antibadword = true;
        saveGroupSettings(chat, settings); return `✅ Word filter enabled for ${words.length} configured word(s).`;
    }
    const modes = { antibadword: "antibadword", antigroupmention: "antigroupmention", antigroupstatus: "antigroupstatus", antispam: "antispam", antisticker: "antisticker", antitag: "antitag", autosticker: "autosticker" };
    const key = modes[command];
    if (key) {
        const action = String(args[0] || "status").toLowerCase();
        if (!["on", "off", "status"].includes(action)) return command === "antibadword" ? `Usage: ${prefix()}antibadword on|off|status or .antibadword words word1,word2` : `Usage: ${prefix()}${command} on|off|status`;
        settings.features ||= {};
        if (action !== "status") settings.features[key] = action === "on";
        saveGroupSettings(chat, settings);
        const detail = command === "antibadword" && settings.features[key] && !(settings.features.blockedWords || []).length ? " Add words with .antibadword words word1,word2 to activate filtering." : "";
        return `🛡️ ${command}: ${settings.features[key] ? "ON" : "OFF"}.${detail}`;
    }
    if (command === "groupstatus") return "Group status management is not exposed by the current WhatsApp library; no setting was changed.";
    if (command === "clean") return "🧹 Message cleanup is not enabled: WhatsApp does not provide a safe bulk-delete API for arbitrary chat history.";
    if (command === "delete") {
        const key = m?.message?.extendedTextMessage?.contextInfo?.stanzaId;
        const participant = m?.message?.extendedTextMessage?.contextInfo?.participant;
        if (!key) return `Reply to a message with ${prefix()}delete.`;
        await sock.sendMessage(chat, { delete: { remoteJid: chat, id: key, participant, fromMe: false } }); return null;
    }
    if (command === "delgcstatus") return "Group status deletion is not supported by WhatsApp's official message controls.";
    if (command === "pending") return "Pending join requests are not exposed consistently by the current WhatsApp library.";
    return null;
}

async function ownerControl(command, sock, m, args) {
    if (!isOwner(m)) return "🚫 Owner-only command.";
    const config = getCachedConfig(); const arg = args.join(" ").trim();
    if (command === "setprefix") {
        return "The command prefix is fixed to a leading dot (.). Prefix changes are disabled.";
    }
    if (command === "setbotname") {
        if (!arg || arg.length > 40 || /[\r\n\u0000-\u001f]/.test(arg)) return `Usage: ${prefix()}setbotname <menu title, up to 40 characters>`;
        updateConfig({ menuTitle: arg }); invalidateConfigCache(); return `✅ Bot menu title updated to *${arg}*. The actual WhatsApp profile name must still be changed in WhatsApp settings.`;
    }
    if (command === "setownername") {
        if (!arg || arg.length > 50 || /[\r\n\u0000-\u001f]/.test(arg)) return `Usage: ${prefix()}setownername <display name, up to 50 characters>`;
        updateConfig({ menuOwnerName: arg }); invalidateConfigCache(); return `✅ Menu owner display name updated to *${arg}*.`;
    }
    if (command === "setbotpp") return "Reply to an image and use WhatsApp profile settings to change the bot photo; this library build does not expose a profile-photo update method.";
    if (command === "setmenuimage") {
        const directImage = m?.message?.imageMessage;
        const quoted = m?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedImage = quoted?.imageMessage || quoted?.ephemeralMessage?.message?.imageMessage;
        if (!directImage && !quotedImage) return `Send an image with ${prefix()}setmenuimage as its caption, or reply to an image with ${prefix()}setmenuimage.`;
        let buffer;
        try { buffer = directImage ? await downloadMediaMessage(m, "buffer", {}, {}) : await mediaBuffer(m); }
        catch { return "❌ Could not read that image. Send or quote a regular image (not View Once) and retry."; }
        if (!buffer || buffer.length > 8 * 1024 * 1024) return "❌ Menu image must be a supported image no larger than 8 MB.";
        let image;
        try { image = await loadImage(buffer); } catch { return "❌ The attached file is not a valid image."; }
        const canvas = createCanvas(900, 500); const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, 900, 500);
        const scale = Math.max(900 / image.width, 500 / image.height); const width = image.width * scale, height = image.height * scale;
        ctx.drawImage(image, (900 - width) / 2, (500 - height) / 2, width, height);
        const dir = join(process.cwd(), "assets"); const target = join(dir, "menu.jpeg"); const temp = join(dir, `.menu-${process.pid}-${Date.now()}.tmp`);
        try { mkdirSync(dir, { recursive: true }); writeFileSync(temp, canvas.toBuffer("image/jpeg", 85)); renameSync(temp, target); }
        catch (error) { try { unlinkSync(temp); } catch {} return `❌ Could not save menu image: ${error.message}`; }
        return "✅ Menu image updated. Run .menu to preview it.";
    }
    if (command === "setnewsletter") return "Newsletter target changes are disabled unless the official channel integration is configured by the owner.";
    if (command === "newsletter") return "Newsletter posting is disabled: the bot does not have an authorized newsletter publishing endpoint.";
    if (command === "broadcast") return "Broadcast is disabled to prevent unsolicited bulk messaging. Send a message directly or use WhatsApp's opted-in broadcast lists.";
    if (command === "restart") return "Restart from Railway's Deployments page so the service shuts down gracefully and reports deployment health.";
    if (command === "update") return "Updates are deployed from the linked GitHub repository; trigger a Railway deploy after reviewing the commit.";
    if (command === "sudo") return "Additional sudo accounts cannot be added through chat; configure owner access through Railway's OWNER_NUMBER variable.";
    if (command === "suppress") return "Usage: .suppress status — message suppression is not enabled for this bot.";
    if (command === "mode") return `Current mode: ${config.mode || "public"}. This command does not change access policy.`;
    if (command === "savestatus" || command === "statusdl" || command === "statusdownload") return await saveRepliedStatus(sock, m);
    if (command === "statusreply") {
        const action = (args[0] || "status").toLowerCase();
        if (action === "status") return `Status reply: ${config.statusReplyEnabled ? "ON" : "OFF"}\nReply text: ${config.statusReplyText || "(not set)"}`;
        if (!["on", "off"].includes(action)) return `Usage: ${prefix()}statusreply on|off|status`;
        updateConfig({ statusReplyEnabled: action === "on" }); invalidateConfigCache();
        return `✅ Automatic replies to direct replies on your WhatsApp status are ${action.toUpperCase()}.`;
    }
    if (command === "setstatusreply") {
        if (!arg || arg.length > 500 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(arg)) return `Usage: ${prefix()}setstatusreply <text, max 500 characters>`;
        updateConfig({ statusReplyText: arg }); invalidateConfigCache(); return "✅ Custom status-reply text saved. Enable it with .statusreply on.";
    }
    if (command === "autoreact") {
        const action = String(args[0] || "status").toLowerCase();
        if (!["on", "off", "status"].includes(action)) return `Usage: ${prefix()}autoreact on|off|status`;
        if (action === "status") return `👍 Automatic reactions are ${config.autoReactEnabled ? "ON" : "OFF"}.`;
        updateConfig({ autoReactEnabled: action === "on" });
        invalidateConfigCache();
        return `✅ Automatic reactions are now ${action.toUpperCase()}.`;
    }
    if (command === "autostatus") return `Usage: ${prefix()}autostatus on|off. Automatic status posting is disabled.`;
    if (command === "afk") {
        const all = readJson(ACTIVITY_FILE, {}); const user = bare(jidOf(m));
        all.afk ||= {}; all.afk[user] = arg ? { since: Date.now(), reason: arg.slice(0, 160) } : null;
        writeJson(ACTIVITY_FILE, all); return arg ? `🌙 AFK enabled: ${arg.slice(0, 160)}` : "👋 AFK disabled.";
    }
    if (command === "pmblocker") return "Private-message blocking automation is disabled; block contacts using WhatsApp's own privacy controls.";
    return "This owner setting is not supported by the current WhatsApp library.";
}

export async function handleAfkMessage(sock, m) {
    if (!m?.message) return;
    const all = readJson(ACTIVITY_FILE, {});
    const statuses = all.afk || {};
    const sender = bare(jidOf(m));
    if (statuses[sender] && (m.key?.fromMe || isOwner(m))) {
        delete statuses[sender]; all.afk = statuses; writeJson(ACTIVITY_FILE, all);
        return;
    }
    const mentions = m.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const active = [...new Set(mentions.map(bare))].filter(user => statuses[user]);
    if (!active.length) return;
    const chat = chatOf(m); const now = Date.now();
    if (now - (afkNoticeCooldown.get(chat) || 0) < 60000) return;
    afkNoticeCooldown.set(chat, now);
    const notices = active.map(user => {
        const info = statuses[user];
        const ago = info?.since ? Math.max(1, Math.floor((now - info.since) / 60000)) : 0;
        return `@${user} is away${ago ? ` (${ago} min)` : ""}${info?.reason ? `: ${String(info.reason).slice(0, 120)}` : "."}`;
    });
    await sock.sendMessage(chat, { text: `🌙 ${notices.join("\n")}`, mentions: active.map(user => `${user}@s.whatsapp.net`) });
}

async function utility(command, sock, m, args) {
    const text = args.join(" ").trim();
    if (command === "ytvideo") return video(sock, m, args);
    if (command === "movie") return movie(sock, m, args);
    if (["igs", "igsc", "igsf"].includes(command)) return instagram(sock, m, args);
    if (command === "groupstats") {
        if (!isGroup(m)) return "This command only works in a group.";
        const meta = await sock.groupMetadata(chatOf(m));
        return `📊 *${meta.subject || "Group"}*\nMembers: ${meta.participants?.length || 0}\nAdmins: ${meta.participants?.filter(p => p.admin).length || 0}\nCreated: ${meta.creation ? new Date(meta.creation * 1000).toLocaleDateString("en-GB") : "Not provided"}`;
    }
    if (command === "myactivity") return "🔒 This bot does not archive or score private chat history. Your activity command is privacy-limited and no historical usage data is stored.";
    if (command === "getpp") {
        const target = mention(m);
        if (!target) return `Reply to a user or mention them with ${prefix()}getpp.`;
        let url;
        try { url = await sock.profilePictureUrl(target, "image"); } catch { return "That profile photo is unavailable or hidden by WhatsApp privacy settings."; }
        if (typeof url !== "string" || !url) return "That profile photo is unavailable or hidden by WhatsApp privacy settings.";
        let u;
        try { u = new URL(url); } catch { return "WhatsApp did not provide a valid profile-photo link."; }
        if (u.protocol !== "https:" || !(u.hostname === "whatsapp.net" || u.hostname.endsWith(".whatsapp.net"))) return "WhatsApp did not provide a valid profile-photo link.";
        const r = await axios.get(url, { responseType: "arraybuffer", timeout: 8000, maxContentLength: MAX_MEDIA, maxRedirects: 0 });
        return { image: Buffer.from(r.data), caption: `Profile photo for @${bare(target)}`, mentions: [target] };
    }
    if (["attp", "bratgpt", "simage"].includes(command)) {
        if (command === "simage") {
            let image = null;
            const context = m?.message?.extendedTextMessage?.contextInfo;
            try { if (context?.quotedMessage) image = await mediaBuffer(m); } catch {}
            if (!image) return `Reply to an image with ${prefix()}simage.`;
            const img = await loadImage(image); const canvas = createCanvas(512, 512); const ctx = canvas.getContext("2d");
            const scale = Math.max(512 / img.width, 512 / img.height); const w = img.width * scale, h = img.height * scale;
            ctx.drawImage(img, (512 - w) / 2, (512 - h) / 2, w, h);
            return { image: canvas.toBuffer("image/png"), caption: "Image converted to a square preview." };
        }
        if (!text) return `Usage: ${prefix()}${command} <text>`;
        return { image: canvasCard(command === "attp" ? "Animated-text style" : "Brat-style", text, command === "bratgpt" ? "#65d34e" : "#7c3aed"), caption: "Static text graphic (animated sticker export is not available in this build)." };
    }
    if (command === "crop") {
        let image; try { image = await mediaBuffer(m); } catch {}
        if (!image) return `Reply to an image with ${prefix()}crop.`;
        const img = await loadImage(image); const side = Math.min(img.width, img.height); const canvas = createCanvas(side, side);
        canvas.getContext("2d").drawImage(img, (img.width-side)/2, (img.height-side)/2, side, side, 0, 0, side, side);
        return { image: canvas.toBuffer("image/png"), caption: "Centered square crop." };
    }
    if (command === "ssweb") {
        const raw = text.match(/https?:\/\/\S+/i)?.[0]; if (!raw) return `Usage: ${prefix()}ssweb https://example.com`;
        const url = new URL(raw); if (url.protocol !== "https:" || !url.hostname.includes(".") || isIP(url.hostname) || /(^|\.)(localhost|local|internal)$/i.test(url.hostname)) return "Only public HTTPS website domain names are accepted; local or IP-address URLs are blocked.";
        const endpoint = `https://image.thum.io/get/width/1280/crop/900/noanimate/${encodeURIComponent(url.href)}`;
        const r = await axios.get(endpoint, { responseType: "arraybuffer", timeout: 20000, maxContentLength: MAX_MEDIA, maxRedirects: 0 });
        return { image: Buffer.from(r.data), caption: `Website screenshot: ${url.hostname}` };
    }
    if (command === "take" || command === "takepack") {
        let image; try { image = await mediaBuffer(m); } catch {}
        if (!image) return `Reply to supported media/sticker with ${prefix()}${command}.`;
        try { await sock.sendMessage(chatOf(m), { sticker: image }, { quoted: m }); return null; }
        catch { return "That reply could not be converted into a supported WhatsApp sticker."; }
    }
    if (command === "tts") return "Text-to-speech is not configured on this server. Add a trusted TTS provider before using this command.";
    if (command === "zoom") return "Zoom meeting creation is not configured; use your organization's official Zoom account to create meetings.";
    if (command === "imagine") return "Image generation is not configured for this bot. No image request was sent or billed.";
    if (command === "pinterest" || command === "twitter") return "This source is not supported by the configured downloader. Use .instagram or .video with a public link; private or restricted posts cannot be fetched.";
    if (command === "vv2") return "Reply to your own View Once media with .vv. The bot will not recover another person's View Once content.";
    if (command === "zoom") return "Zoom integration is not configured.";
    if (command === "myactivity") return "No chat history is archived by this bot.";
    if (command === "uptime") return `⏱️ Process uptime: ${Math.floor(process.uptime() / 60)} minute(s).`;
    if (command === "memegen") return { image: canvasCard("MEME", text || "When the tests pass on the first try", "#be123c"), caption: "Original meme card generated locally." };
    if (command === "memesearch") return `😂 Meme idea: ${pick(["When the bot says 'one moment' and comes back with a full report.", "Me checking Railway logs after every tiny edit.", "When the Wi-Fi reconnects exactly as the meeting ends."])}`;
    if (command === "roastai") {
        if (!text) return `Usage: ${prefix()}roastai <topic>`;
        return await generateAIResponse([{ role: "user", content: `Write one light, non-targeted, non-abusive roast about this topic. No slurs, threats, protected-class targeting or humiliation. Topic: ${text.slice(0, 300)}` }]);
    }
    return null;
}

const GAMES = new Set(["bomb", "bet", "horse", "slots", "coinflip", "tictactoe", "fish", "hunt", "chop", "forage", "rpg", "rpginv", "rpgshop", "rpgbuy", "sellloot", "guessnumber", "hangman", "quiz", "roulette", "hotseat", "roastbattle", "debate"]);
const ticTacToeGames = new Map();

function tttBoard(board) {
    const cell = (index) => board[index] || String(index + 1);
    return `${cell(0)} │ ${cell(1)} │ ${cell(2)}\n──┼───┼──\n${cell(3)} │ ${cell(4)} │ ${cell(5)}\n──┼───┼──\n${cell(6)} │ ${cell(7)} │ ${cell(8)}`;
}

function tttWinner(board) {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a,b,c] of lines) if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    return board.every(Boolean) ? "draw" : null;
}

function playTicTacToe(args, m) {
    const chat = m?.key?.remoteJid;
    const sender = m?.key?.participant || chat;
    if (!chat?.endsWith("@g.us")) return "❌ Tic-Tac-Toe is a two-player group game. Run it in a group chat.";
    for (const [key, game] of ticTacToeGames) if (Date.now() - game.updatedAt > 30 * 60 * 1000) ticTacToeGames.delete(key);

    const action = String(args[0] || "").toLowerCase();
    let game = ticTacToeGames.get(chat);
    if (["start", "new"].includes(action) || !action) {
        if (game && game.players.length < 2 && Date.now() - game.updatedAt < 30 * 60 * 1000) return "A Tic-Tac-Toe game is already waiting. Another member can use .tictactoe join.";
        game = { board: Array(9).fill(""), players: [sender], updatedAt: Date.now(), turn: 0 };
        ticTacToeGames.set(chat, game);
        return `❌⭕ *TIC-TAC-TOE*\n${tttBoard(game.board)}\n\n${sender} starts as X. A second member: .tictactoe join`;
    }
    if (!game) return "No game is active. Start one with .tictactoe start.";
    if (action === "join") {
        if (game.players.length >= 2) return "This game already has two players.";
        if (game.players[0] === sender) return "A different group member must join as O.";
        game.players.push(sender); game.updatedAt = Date.now();
        return `❌⭕ ${sender} joined as O. X moves first. Use .tictactoe <1-9>.\n${tttBoard(game.board)}`;
    }
    if (game.players.length < 2) return "Waiting for a second group member. Join with .tictactoe join.";
    const cell = Number(action) - 1;
    if (!Number.isInteger(cell) || cell < 0 || cell > 8) return "Choose a board cell from 1 to 9 with .tictactoe <1-9>.";
    if (game.players[game.turn] !== sender) return `It is ${game.turn === 0 ? "X" : "O"}'s turn.`;
    if (game.board[cell]) return "That cell is already taken. Choose an empty number.";
    const mark = game.turn === 0 ? "X" : "O";
    game.board[cell] = mark; game.updatedAt = Date.now();
    const result = tttWinner(game.board);
    if (result) {
        ticTacToeGames.delete(chat);
        return `❌⭕ ${result === "draw" ? "It's a draw!" : `${mark} wins!`}\n${tttBoard(game.board)}\n\nStart another round with .tictactoe start.`;
    }
    game.turn = 1 - game.turn;
    return `❌⭕ ${mark} played. Next: ${game.turn === 0 ? "X" : "O"}.\n${tttBoard(game.board)}`;
}

async function game(command, args, m) {
    if (command === "coinflip") return `🪙 ${pick(["Heads", "Tails"])}!`;
    if (command === "dice") return `🎲 ${1 + Math.floor(Math.random() * 6)}`;
    if (command === "slots") return `🎰 ${pick(["🍒 🍋 🍒", "⭐ ⭐ ⭐", "🍋 🍋 🍇", "7️⃣ 7️⃣ 7️⃣"])} (no real money or wagering).`;
    if (command === "bomb") return `💣 Safe bomb round: ${pick(["You defused the pretend bomb!", "You found the harmless timer and escaped!", "The cartoon bomb turned into confetti!"])} No real-world instructions or stakes.`;
    if (command === "bet") return `🎲 Practice round: ${pick(["You win the pretend round!", "The house wins this imaginary round.", "It's a friendly draw."])} No money or coins were placed.`;
    if (command === "horse") return `🏇 Race results: ${pick(["Thunder", "Comet", "Sunny"])} finishes first, followed by ${pick(["Comet", "Sunny", "Thunder"])}. Fictional race; no wagering.`;
    if (command === "roulette") return `🎡 The wheel lands on ${pick(["red", "black", "green"])}. No wagers or real money.`;
    if (command === "tictactoe") return playTicTacToe(args, m);
    if (command === "guessnumber") return `🔢 Guess a number from 1 to 10: ${pick(["3", "6", "8", "2", "9"])} (example round; start your own guess).`;
    if (command === "hangman") return "🎮 Hangman word: _ _ _ _ (4 letters). Reply in chat to play; this lightweight mode does not persist turns.";
    if (command === "quiz") return `🧠 Quick quiz: Which planet is known as the Red Planet?\nA) Venus  B) Mars  C) Jupiter\nAnswer: ${prefix()}quiz answer <choice>`;
    if (command === "rpginv") return "🎒 RPG inventory is empty. Use .rpg to begin a local, no-stakes story.";
    if (command === "rpgshop") return "🛍️ RPG shop: this lightweight roleplay has no real-money or transferable items.";
    if (command === "rpgbuy" || command === "sellloot") return "This roleplay build does not support trading or purchases between members.";
    if (["fish", "hunt", "chop", "forage"].includes(command)) return `🌿 ${pick(["You found a pinecone.", "You collected a few berries.", "You spotted a colorful bird.", "You found a smooth stone."])} (role-play only; no real stakes).`;
    if (command === "rpg") return "🗺️ You reach a fork in a fictional trail. Choose: north (forest), east (river), or west (village). No purchases or real-world actions.";
    if (command === "hotseat") return `🔥 Hot seat: ${pick(["What small thing always makes you smile?", "Which place would you visit again?", "What skill would you like to learn?"])}`;
    if (command === "roastbattle") return "🎭 Keep it friendly: each participant may share one consensual, non-targeted joke. No slurs, threats, or harassment.";
    if (command === "debate") return `🗣️ Debate topic: ${pick(["Should cities prioritize parks or transit?", "Are books better than films?", "Is breakfast food good at every hour?"])}`;
    return `🎮 ${command}: ${pick(["Your turn!", "A new round is ready.", "No real money or prizes are involved."])}`;
}

async function anime(command) {
    const category = command === "konachan" ? "neko" : command === "random" ? "waifu" : command;
    const response = await axios.get(`https://api.waifu.pics/sfw/${category}`, { timeout: 8000, maxRedirects: 0 });
    const url = new URL(response.data?.url || "");
    if (url.protocol !== "https:" || !url.hostname.endsWith("waifu.pics")) throw new Error("Anime image provider returned an invalid link.");
    return { image: { url: url.href }, caption: "SFW anime image from a public image provider." };
}

async function resetEconomy(command, m, args) {
    if (!isOwner(m)) return "🚫 Owner-only command.";
    const all = readJson(ECONOMY_FILE, {});
    if (command === "resetbalance" || command === "resetcoin" || command === "resetdi") {
        const target = String(args[0] || "").replace(/\D/g, "");
        if (!target) return `Usage: ${prefix()}${command} <phone number>`;
        if (!all[target]) return "No local economy record exists for that number.";
        all[target].coins = 0; all[target].bank = 0; all[target].inventory = [];
        writeJson(ECONOMY_FILE, all); return `✅ Local game balance reset for ${target}.`;
    }
    return null;
}

export async function runCatalogCommand(command, sock, m, args = []) {
    try {
        if (["ytvideo", "movie", "groupstats", "myactivity", "getpp", "attp", "bratgpt", "simage", "crop", "ssweb", "take", "takepack", "tts", "zoom", "imagine", "pinterest", "twitter", "igs", "igsc", "igsf", "vv2", "uptime", "memegen", "memesearch", "roastai"].includes(command)) return await utility(command, sock, m, args);
        if (["antibadword", "antibot", "antigroupmention", "antigroupstatus", "antispam", "antisticker", "antitag", "autosticker", "clean", "delete", "delgcstatus", "groupstatus", "pending"].includes(command)) return await groupModeration(command, sock, m, args);
        if (["afk", "autoreact", "autostatus", "broadcast", "mode", "newsletter", "pmblocker", "restart", "savestatus", "setbotname", "setownername", "setbotpp", "setmenuimage", "setnewsletter", "setprefix", "setstatusreply", "statusreply", "sudo", "suppress", "update"].includes(command)) return await ownerControl(command, sock, m, args);
        if (["resetbalance", "resetcoin", "resetdi"].includes(command)) return await resetEconomy(command, m, args);
        if (["daily", "weekly", "work", "crime", "mine", "balance", "dep", "wd", "pay", "shop", "buy", "levelup", "role", "autolevelup", "topcoins", "economy"].includes(command)) return await economy(command, args, m);
        if (GAMES.has(command)) return await game(command, args, m);
        if (["konachan", "neko", "random"].includes(command)) return await anime(command);
        const fun = funReply(command, args, m); if (fun) return fun;
        if (["1917", "arena", "blackpink", "devil", "fire", "glitch", "hacker", "ice", "impressive", "leaves", "light", "metallic", "neon", "purple", "sand", "snow", "thunder", "zoom"].includes(command)) {
            const text = args.join(" ").trim() || "Hello!";
            return { image: canvasCard(command.toUpperCase(), text, "#7c3aed"), caption: `Text graphic: ${command}` };
        }
        if (command === "waifu") return await anime(command);
        if (command === "imagine") return "Image generation is not configured for this bot.";
        return `The .${command} command is registered, but this feature is not enabled in the current deployment.`;
    } catch (error) {
        console.warn(`[Catalog] .${command} failed:`, error.message);
        return `❌ .${command} could not complete: ${String(error.message || "service unavailable").slice(0, 180)}`;
    }
}

export async function runStatusDownloadCommand(sock, m) {
    if (!isOwner(m)) return "🚫 Status downloads are available only to the bot owner.";
    return saveRepliedStatus(sock, m);
}
