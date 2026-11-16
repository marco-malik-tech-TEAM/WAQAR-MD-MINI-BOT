import test from "node:test";
import assert from "node:assert/strict";
import { commands } from "../commands/index.js";
import { recoverViewOnce, unwrapViewOnceMessage, viewonce } from "../commands/tools/viewonce.js";
import { clearMessageOwnershipCache, getCachedMessageOwner, recordMessageOwnership } from "../services/messageOwnershipCache.js";
import { muth } from "../commands/fun/muth.js";
import { dice } from "../commands/fun/dice.js";

const botJid = "999@s.whatsapp.net";

test(".vv is registered and unwraps nested View Once wrappers and embedded flags", () => {
    assert.equal(typeof commands.vv, "function");
    assert.equal(typeof commands.viewonce, "function");
    const payload = { imageMessage: { mimetype: "image/jpeg" } };
    const result = unwrapViewOnceMessage({ ephemeralMessage: { message: { viewOnceMessageV2: { message: payload } } } });
    assert.equal(result.isViewOnce, true);
    assert.equal(result.content, payload);

    for (const wrapper of ["viewOnceMessage", "viewOnceMessageV2", "viewOnceMessageV2Extension"]) {
        const wrapped = unwrapViewOnceMessage({ [wrapper]: { message: { videoMessage: {} } } });
        assert.equal(wrapped.isViewOnce, true, `${wrapper} should be recognized`);
        assert.equal(wrapped.mediaType, "video");
    }
    for (const key of ["imageMessage", "videoMessage", "audioMessage"]) {
        assert.equal(unwrapViewOnceMessage({ [key]: { viewOnce: true } }).isViewOnce, true, `${key}.viewOnce should be recognized`);
    }
});

test(".vv refuses ordinary media and refuses another sender's View Once media", async () => {
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

test(".vv can verify a direct-chat quote using sender metadata only, without caching its media", async () => {
    clearMessageOwnershipCache();
    const chatJid = "111@s.whatsapp.net";
    const original = {
        key: { remoteJid: chatJid, id: "quoted-own-view-once", fromMe: false },
        message: { viewOnceMessageV2: { message: { imageMessage: { mimetype: "image/jpeg", fileLength: 3 } } } }
    };
    assert.equal(recordMessageOwnership(original, botJid), true);
    assert.equal(getCachedMessageOwner(original.key.id, chatJid), chatJid);

    const command = {
        key: { remoteJid: chatJid, id: "vv-command", fromMe: false },
        message: { extendedTextMessage: { contextInfo: {
            stanzaId: original.key.id,
            quotedMessage: original.message
        } } }
    };
    const sent = [];
    const sock = { user: { id: botJid }, sendMessage: async (...args) => sent.push(args) };
    const payload = Buffer.from("image bytes");
    const result = await recoverViewOnce(sock, command, {
        download: async (_sock, _media, type) => {
            assert.equal(type, "image");
            return payload;
        }
    });
    assert.equal(result, undefined);
    assert.deepEqual(sent[0][1].image, payload);
    assert.match(sent[0][1].caption, /Your own View Once media/);
    clearMessageOwnershipCache();
});

test(".vv sends video and voice-note media when the View Once flag is embedded in the media object", async () => {
    const sent = [];
    const sock = { user: { id: botJid }, sendMessage: async (...args) => sent.push(args) };
    for (const [key, type, expectedKey, ptt] of [
        ["videoMessage", "video", "video", false],
        ["audioMessage", "audio", "audio", true]
    ]) {
        const media = { viewOnce: true, mimetype: type === "audio" ? "audio/ogg; codecs=opus" : "video/mp4", fileLength: 8, ptt };
        const message = {
            key: { remoteJid: "12345-678@g.us", participant: "111@s.whatsapp.net", id: `cmd-${type}` },
            message: { extendedTextMessage: { contextInfo: {
                participant: "111@s.whatsapp.net",
                quotedMessage: { [key]: media }
            } } }
        };
        const result = await recoverViewOnce(sock, message, { download: async (_sock, _media, actualType) => {
            assert.equal(actualType, type);
            return Buffer.from(`${type} bytes`);
        } });
        assert.equal(result, undefined);
        assert.ok(sent.at(-1)[1][expectedKey]);
        if (type === "audio") assert.equal(sent.at(-1)[1].ptt, true);
    }
    assert.equal(sent.length, 2);
});

test("message ownership cache normalizes device JIDs and expires without retaining content", () => {
    clearMessageOwnershipCache();
    const originalNow = Date.now;
    let clock = originalNow();
    Date.now = () => clock;
    try {
        const message = { key: { remoteJid: "111@s.whatsapp.net", id: "direct-message", fromMe: false }, message: { imageMessage: { viewOnce: true, fileLength: 999 } } };
        assert.equal(recordMessageOwnership(message, botJid), true);
        assert.equal(getCachedMessageOwner("direct-message", "111:7@s.whatsapp.net"), "111@s.whatsapp.net");
        clock += 60 * 60 * 1000 + 1;
        assert.equal(getCachedMessageOwner("direct-message", "111@s.whatsapp.net"), null);
    } finally {
        Date.now = originalNow;
        clearMessageOwnershipCache();
    }
});

test(".dice returns a formatted roll instead of referencing an undefined die symbol array", async () => {
    const result = await dice({}, { key: { remoteJid: "12345-678@g.us" } }, []);
    assert.match(result, /Die 1:/);
    assert.match(result, /Total:/);
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
