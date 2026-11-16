// Playful step-by-step tea-making prank; this does not access or alter any device.
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export const chai = async (sock, m, args) => {
    const jid = m.key.remoteJid;
    const ctx = m.message?.extendedTextMessage?.contextInfo;
    const target = ctx?.mentionedJid?.[0] || ctx?.participant || null;
    const tag = target ? `@${target.split("@")[0]}` : (args.join(" ") || "friend");
    const mentions = target ? [target] : [];
    const say = (text) => sock.sendMessage(jid, { text, mentions });

    const steps = [
        `🎯 *Tea order for:* ${tag}`,
        "🔥 Warming up the kettle...",
        "🙌 Getting the cups ready...",
        "🫖 Adding tea leaves and sugar...",
        "☕", "☕☕", "☕☕☕", "☕☕☕☕", "☕☕☕☕☕ *Five minutes brewing!*",
        "💧 Adding a splash of water...", "💧💧 A little more...", "💦 Stirring it gently...", "💦💧 Almost ready...", "💦💧💦 Perfect!",
        "😮‍💨 Letting it cool...",
        "😋 Smells delicious!",
        `✅ *Order complete!* Tea for ${tag} is ready ☕`,
        "😂 Just a friendly tea-making prank. Enjoy!"
    ];
    for (const s of steps) { await say(s); await sleep(1500); }
};
