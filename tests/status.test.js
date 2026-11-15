import test from "node:test";
import assert from "node:assert/strict";
import { cacheStatus, saveCachedStatus, saveRepliedStatus } from "../services/statusSaver.js";
import { commands } from "../commands/index.js";

const linkedNumber = "923377857866";
const statusId = `status-test-${process.pid}`;
const owner = `${linkedNumber}@s.whatsapp.net`;

test("a recent ordinary text status can be explicitly saved to the linked account's own chat", async () => {
    const statusMessage = {
        key: { remoteJid: "status@broadcast", participant: "923000000000@s.whatsapp.net", id: statusId, fromMe: false },
        message: { extendedTextMessage: { text: "A test status", contextInfo: {} } }
    };
    assert.equal(cacheStatus(statusMessage), true);
    const sent = [];
    const sock = { user: { id: `${linkedNumber}:8@s.whatsapp.net` }, sendMessage: async (...args) => sent.push(args) };
    const reply = await saveCachedStatus(sock, statusId);
    assert.match(reply, /saved to the linked WhatsApp account/i);
    assert.equal(sent[0][0], owner);
    assert.match(sent[0][1].text, /A test status/);
    assert.match(sent[0][1].text, /MARCO MALIK X/);
});

test("status downloader requires replying to a status and refuses View Once content", async () => {
    const noQuote = await saveRepliedStatus({}, { message: { conversation: ".statusdl" } });
    assert.match(noQuote, /Reply to a viewed WhatsApp status/i);
    const viewOnce = { key: { remoteJid: "status@broadcast", participant: owner, id: `${statusId}-viewonce` }, message: { viewOnceMessageV2: { message: { imageMessage: { caption: "private" } } } } };
    assert.equal(cacheStatus(viewOnce), false);
});

test("status downloader command alias is registered and owner-protected", async () => {
    assert.equal(typeof commands.savestatus, "function");
    assert.equal(typeof commands.statusdl, "function");
    assert.equal(typeof commands.statusdownload, "function");
    const response = await commands.statusdl({}, { key: { remoteJid: "123456789@s.whatsapp.net", participant: "123456789@s.whatsapp.net" }, message: {} }, []);
    assert.match(response, /owner/i);
});
