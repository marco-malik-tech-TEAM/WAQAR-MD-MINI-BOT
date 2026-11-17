import test from "node:test";
import assert from "node:assert/strict";
import { reactToIncomingMessage, shouldAutoReact } from "../services/messageReactions.js";

const incoming = (overrides = {}) => ({
    key: { remoteJid: "12345@s.whatsapp.net", id: `msg-${Math.random()}`, fromMe: false },
    message: { conversation: "hello" },
    ...overrides
});

test("auto-react targets enabled ordinary incoming direct and group messages only", () => {
    assert.equal(shouldAutoReact(incoming(), true), true);
    assert.equal(shouldAutoReact(incoming({ key: { remoteJid: "group@g.us", id: "group-1", participant: "123@s.whatsapp.net" } }), true), true);
    assert.equal(shouldAutoReact(incoming(), false), false);
    assert.equal(shouldAutoReact(incoming({ key: { remoteJid: "1@s.whatsapp.net", id: "self", fromMe: true } }), true), false);
    assert.equal(shouldAutoReact(incoming({ key: { remoteJid: "status@broadcast", id: "status" } }), true), false);
    assert.equal(shouldAutoReact(incoming({ message: { reactionMessage: {} } }), true), false);
});

test("auto-react sends one thumbs-up reaction per message ID", async () => {
    const message = incoming({ key: { remoteJid: "12345@s.whatsapp.net", id: "auto-react-regression", fromMe: false } });
    const sent = [];
    const sock = { sendMessage: async (...args) => sent.push(args) };
    assert.equal(await reactToIncomingMessage(sock, message, true), true);
    assert.equal(await reactToIncomingMessage(sock, message, true), false);
    assert.equal(sent.length, 1);
    assert.equal(sent[0][1].react.text, "👍");
});
