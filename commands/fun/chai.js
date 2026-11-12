// Funny step-by-step "prank" command (clean version): chai banane ka mazaaki process
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export const chai = async (sock, m, args) => {
    const jid = m.key.remoteJid;
    const ctx = m.message?.extendedTextMessage?.contextInfo;
    const target = ctx?.mentionedJid?.[0] || ctx?.participant || null;
    const tag = target ? `@${target.split("@")[0]}` : (args.join(" ") || "Target");
    const mentions = target ? [target] : [];
    const say = (text) => sock.sendMessage(jid, { text, mentions });

    const steps = [
        `🎯 *Target Fix:* ${tag}`,
        "🔥 Mahaul garam ho raha hai...",
        "🙌 Haath ready hain...",
        "🧴 Cheeni aur patti daal raha hun...",
        "☕", "☕☕", "☕☕☕", "☕☕☕☕", "☕☕☕☕☕ *5 ubaal!*",
        "💧 Ek qatra paani ka", "💧💧 Do qatre paani ke", "💦💧💦 Teen qatre fawware ke saath", "💦💧💦💧 Chaar qatre", "💦💧💦💧💦 Paanch qatre!",
        "😮‍💨 Uff...",
        "😋 Maza aa gaya!",
        `✅ *Target Complete!* ${tag} ki chai tayyar hai ☕`,
        "🛁 Ab jaake nahaa lo... nahi nahi, pehle chai pi lo! 😂"
    ];
    for (const s of steps) { await say(s); await sleep(1500); }
};
