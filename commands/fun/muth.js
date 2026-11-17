/**
 * .muth  - funny Urdu sequence. Tags ONLY the person who writes the command.
 * Every step is its own new message. No extra packages needed.
 */
async function muthCmd(sock, chatId, msg) {
    const sender = msg.key.participant || (msg.key.fromMe ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : msg.key.remoteJid);
    const tag = '@' + sender.split('@')[0].split(':')[0];
    const mentions = [sender];
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    const steps = [
        `🎯 ٹارگٹ فکس: ${tag}`,
        `🔥 ماحول گرم ہو رہا ہے ${tag} ... 🔥`,
        `🖐️ ہاتھ ریڈی ہے ... ✅`,
        `🧴 شیمپو اور تیل لگا رہا ہوں ... 😏`,
        `🚀 اسٹارٹ کرتے ہیں ...`,
        ...[1, 2, 3, 4, 5].map(n => `${n} ${'✊'.repeat(n)}`),
        ...[1, 2, 3, 4, 5].map(n => `${n} ${Array.from({ length: n }, (_, i) => (i % 2 ? '💦' : '💧')).join('')}`),
        `😫 اُف!! 🙌🙌🙌`,
        `😮‍💨 مزا آ گیا ... 🤤`,
        `😂🤣😂🤣😂🤣😂🤣`,
        `🏁 ${tag} آپ نے مُٹھ مار لی، آپ نے اپنا کام تمام کر لیا! 😂`,
        `🚿 صبح اٹھ کر نہا لینا ... نہیں نہیں، ابھی بھی نہا لو! 🛁🤣`
    ];
    try {
        try { await sock.sendPresenceUpdate('composing', chatId); } catch (_) {}
        for (let i = 0; i < steps.length; i++) {
            try { await sock.sendMessage(chatId, { text: steps[i], mentions }, i === 0 ? { quoted: msg } : undefined); } catch (_) {}
            if (i < steps.length - 1) await sleep(900);
        }
        try { await sock.sendPresenceUpdate('paused', chatId); } catch (_) {}
    } catch (e) { /* joke only */ }
}

module.exports = muthCmd;
