import test from "node:test";
import assert from "node:assert/strict";
import { commands } from "../commands/index.js";
import { unwrapViewOnceMessage, viewonce } from "../commands/tools/viewonce.js";
import { muth } from "../commands/fun/muth.js";

test(".vv command is registered and unwraps nested View Once wrappers", () => {
    assert.equal(typeof commands.vv, "function");
    assert.equal(typeof commands.viewonce, "function");
    const payload = { imageMessage: { mimetype: "image/jpeg" } };
    const result = unwrapViewOnceMessage({ ephemeralMessage: { message: { viewOnceMessageV2: { message: payload } } } });
    assert.equal(result.isViewOnce, true);
    assert.equal(result.content, payload);
});

test(".vv rejects regular media and another sender's View Once message", async () => {
    const ownRegularMessage = {
        key: { remoteJid: "12345-678@g.us", participant: "111@s.whatsapp.net" },
        message: { extendedTextMessage: { contextInfo: {
            participant: "111@s.whatsapp.net",
            quotedMessage: { imageMessage: { mimetype: "image/jpeg" } }
        } } }
    };
    assert.match(await viewonce({}, ownRegularMessage), /not a View Once/i);

    const otherPersonMessage = {
        key: { remoteJid: "12345-678@g.us", participant: "111@s.whatsapp.net" },
        message: { extendedTextMessage: { contextInfo: {
            participant: "222@s.whatsapp.net",
            quotedMessage: { viewOnceMessage: { message: { imageMessage: { mimetype: "image/jpeg" } } } }
        } } }
    };
    assert.match(await viewonce({}, otherPersonMessage), /cannot reveal another person's View Once/i);
});

test("muth can be retried after a short cooldown and sends at most one message per invocation", async () => {
    const originalNow = Date.now;
    let clock = originalNow();
    Date.now = () => clock;
    const outgoing = [];
    const sock = {
        user: { id: "999@s.whatsapp.net" },
        sendMessage: async (...args) => outgoing.push(args)
    };
    try {
        const message = {
            key: { remoteJid: "12345-678@g.us", participant: `test-${clock}-${Math.random()}@s.whatsapp.net` }
        };
        const first = await muth(sock, message);
        assert.equal(first, undefined);
        assert.equal(outgoing.length, 1);
        assert.equal(outgoing[0][1].mentions.length, 1);

        const second = await muth(sock, message);
        assert.match(second, /Wait \d+s/);
        assert.equal(outgoing.length, 1);

        clock += 2001;
        const third = await muth(sock, message);
        assert.equal(third, undefined);
        assert.equal(outgoing.length, 2);
    } finally {
        Date.now = originalNow;
    }
});
