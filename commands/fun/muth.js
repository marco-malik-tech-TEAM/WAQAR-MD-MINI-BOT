/** One-message Muth joke with a per-sender cooldown; avoids multi-message bursts. */
const COOLDOWN_MS = 2000;
const MAX_TRACKED_SENDERS = 2000;
const lastRunBySender = new Map();

function senderJidFor(sock, message) {
    let sender = message?.key?.participant || message?.key?.remoteJid;
    if (message?.key?.fromMe) sender = sock?.user?.id || sender;
    return String(sender || "").replace(/:\d+(?=@)/, "");
}

export const muth = async (sock, message) => {
    const chatId = message?.key?.remoteJid;
    const sender = senderJidFor(sock, message);
    if (!chatId || !sender) return "❌ Could not identify the chat or command sender.";

    const now = Date.now();
    const lastRun = lastRunBySender.get(sender) || 0;
    if (now - lastRun < COOLDOWN_MS) {
        const seconds = Math.ceil((COOLDOWN_MS - (now - lastRun)) / 1000);
        return `⏳ Wait ${seconds}s before running the joke again.`;
    }
    lastRunBySender.set(sender, now);
    while (lastRunBySender.size > MAX_TRACKED_SENDERS) {
        lastRunBySender.delete(lastRunBySender.keys().next().value);
    }

    const tag = `@${sender.split("@")[0]}`;
    const steps = [
        `🎯 ٹارگٹ فکس: ${tag}`,
        `🔥 ماحول گرم ہو رہا ہے ${tag} ... 🔥`,
        "🖐️ ہاتھ ریڈی ہے ... ✅",
        "🧴 شیمپو اور تیل لگا رہا ہوں ... 😏",
        "🚀 اسٹارٹ کرتے ہیں ...",
        ...[1, 2, 3, 4, 5].map(n => `${n} ${"✊".repeat(n)}`),
        ...[1, 2, 3, 4, 5].map(n => `${n} ${Array.from({ length: n }, (_, i) => (i % 2 ? "💦" : "💧")).join("")}`),
        "😫 اُف!! 🙌🙌🙌",
        "😮‍💨 مزا آ گیا ... 🤤",
        "😂🤣😂🤣😂🤣😂🤣",
        `🏁 ${tag} آپ نے مُٹھ مار لی، آپ نے اپنا کام تمام کر لیا! 😂`,
        "🚿 صبح اٹھ کر نہا لینا ... نہیں نہیں، ابھی بھی نہا لو! 🛁🤣"
    ];

    try { await sock.sendPresenceUpdate?.("composing", chatId); } catch {}
    try {
        await sock.sendMessage(chatId, { text: steps.join("\n"), mentions: [sender] }, { quoted: message });
    } finally {
        try { await sock.sendPresenceUpdate?.("paused", chatId); } catch {}
    }
};
