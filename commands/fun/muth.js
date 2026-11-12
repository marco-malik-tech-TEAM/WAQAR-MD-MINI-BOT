// Funny step-by-step command. Targets ONLY the person who ran the command (never anyone else).
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const busy = new Map();

export const muth = async (sock, m, args) => {
    const jid = m.key.remoteJid;
    const isGroup = jid.endsWith("@g.us");

    // Sender = whoever ran the command
    let sender = m.key.participant || jid;
    if (m.key.fromMe) sender = sock.user.id.split(":")[0].split("@")[0] + "@s.whatsapp.net";
    sender = sender.split(":")[0].split("@")[0] + "@s.whatsapp.net";
    const tag = `@${sender.split("@")[0]}`;
    const mentions = [sender];

    const now = Date.now();
    if (now - (busy.get(sender) || 0) < 60000) return `⏳ ${tag} thora sabr karo, pehla round abhi khatam hua hai 😂`;
    busy.set(sender, now);

    const say = (text) => sock.sendMessage(jid, { text, mentions });
    const pause = (ms = 1400) => sleep(ms);

    await say(`🎯 *Target Fix:* ${tag}`); await pause();
    await say("🔥 Mahaul garam ho raha hai..."); await pause();
    await say("🙌 Haath ready hain..."); await pause();
    await say("🧴 Shampoo aur tel laga raha hun..."); await pause();
    await say("🚦 Start karte hain..."); await pause();

    for (let i = 1; i <= 5; i++) {
        const words = ["Ek", "Do", "Teen", "Chaar", "Paanch"][i - 1];
        await say(`${"✊".repeat(i)}\n*${words} muth!*`);
        await pause(1100);
    }

    const drops = [
        "💧 Ek qatra paani ka",
        "💧💧 Do qatre paani ke",
        "💦💧💦 Teen qatre fawware ke saath, idhar udhar bikhre hue",
        "💦💧💦💧 Chaar qatre",
        "💦💧💦💧💦 Paanch qatre!"
    ];
    for (const d of drops) { await say(d); await pause(1100); }

    await say("😮‍💨 Uff..."); await pause();
    await say("😋 Maza aa gaya!"); await pause();
    await say(`✅ *Target Complete!*\n${tag} aap ne muth maar li hai 😂 Aap ne apna kaam kar liya.`); await pause(1600);
    await say("🛁 Subah uth kar naha lena... nahi nahi, *abhi* naha lo! 😂");
};
