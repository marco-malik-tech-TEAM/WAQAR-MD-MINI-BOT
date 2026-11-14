const COOLDOWN_MS = 2000;
const lastRunBySender = new Map();
const MAX_TRACKED_SENDERS = 2000;

const senderJidFor = (sock, message) => {
    let sender = message.key.participant || message.key.remoteJid;
    if (message.key.fromMe) sender = sock.user?.id || sender;
    return String(sender || "").replace(/:\d+(?=@)/, "");
};

export const muth = async (sock, message) => {
    const jid = message.key.remoteJid;
    const sender = senderJidFor(sock, message);
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

    const mention = `@${sender.split("@")[0]}`;
    await sock.sendMessage(jid, {
        text: `😂 *Muth command!* ${mention}, joke delivered. Take a breath—the command is ready again in a few seconds.`,
        mentions: [sender]
    }, { quoted: message });
};
