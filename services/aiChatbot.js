import { formatMarkdown } from "../utils/markdownToWhatsApp.js";
import { getCachedConfig } from "./configService.js";
import { generateAIResponse, hasAIProvider } from "./aiProvider.js";
import { BRAND } from "../brand.js";

const conversations = new Map();
const pending = new Set();
const MAX_CONVERSATIONS = 400;
const MAX_HISTORY_MESSAGES = 12;

function conversationFor(key) {
    let history = conversations.get(key);
    if (!history) {
        history = [];
        conversations.set(key, history);
    }
    conversations.delete(key);
    conversations.set(key, history);
    while (conversations.size > MAX_CONVERSATIONS) {
        conversations.delete(conversations.keys().next().value);
    }
    return history;
}

export async function handleAutoChat(sock, message, text) {
    const config = getCachedConfig();
    if (config.aiChatbotEnabled !== true || !text?.trim() || message.key?.fromMe) return false;

    const jid = message.key?.remoteJid || "";
    if (jid === "status@broadcast" || jid.endsWith("@newsletter")) return false;
    const isGroup = jid.endsWith("@g.us");
    if (isGroup && process.env.AI_AUTO_CHAT_GROUPS !== "true") return false;
    if (!isGroup && !["@s.whatsapp.net", "@lid", "@c.us"].some(suffix => jid.endsWith(suffix))) return false;
    if (!hasAIProvider()) return false;

    const sender = message.key?.participant || jid;
    const key = `${jid}:${sender}`;
    if (pending.has(key)) return false;
    pending.add(key);

    const history = conversationFor(key);
    history.push({ role: "user", content: text.trim().slice(0, 4000) });
    try {
        const response = await generateAIResponse(history);
        const formatted = formatMarkdown(response).slice(0, 3000);
        await sock.sendMessage(jid, {
            text: `🤖 *${BRAND.name} AI*\n\n${formatted}`
        }, { quoted: message });
        history.push({ role: "assistant", content: response.slice(0, 3000) });
        if (history.length > MAX_HISTORY_MESSAGES) history.splice(0, history.length - MAX_HISTORY_MESSAGES);
        return true;
    } catch (error) {
        history.pop();
        console.error("[AI chatbot] Reply failed:", error.message);
        await sock.sendMessage(jid, {
            text: "معذرت، AI اس وقت جواب نہیں دے پا رہا۔ کچھ دیر بعد دوبارہ کوشش کریں۔"
        }, { quoted: message }).catch(() => {});
        return false;
    } finally {
        pending.delete(key);
    }
}

export function clearAIChatHistory() {
    conversations.clear();
}
