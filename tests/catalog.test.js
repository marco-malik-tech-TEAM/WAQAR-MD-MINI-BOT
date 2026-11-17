import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { commands } from "../commands/index.js";
import { catalogCommands, catalogCategories } from "../commands/catalog/index.js";
import { help, formatCatalogCategory } from "../commands/general/help.js";
import { menu2, getMenu2Template } from "../commands/general/menu2.js";
import { COMMAND_ALIASES } from "../services/commandAliases.js";
import { MENU_TEMPLATE, getMenuChunks } from "../MENU2_TEMPLATE.js";

const dummyMessage = { key: { remoteJid: "923000000000@s.whatsapp.net", participant: "923000000000@s.whatsapp.net" }, message: {} };
const ownerMessage = { key: { remoteJid: "923377857866@s.whatsapp.net", participant: "923377857866@s.whatsapp.net" }, message: {} };

test("all 164 commands from the supplied menu have individual files and dispatcher registrations", () => {
    assert.equal(Object.keys(catalogCommands).length, 164);
    const categoryCommands = Object.values(catalogCategories).flat();
    assert.equal(categoryCommands.length, 164);
    assert.equal(new Set(categoryCommands).size, 164);
    for (const [name, handler] of Object.entries(catalogCommands)) {
        assert.equal(typeof handler, "function", `${name} catalog handler`);
        assert.equal(typeof commands[name], "function", `${name} dispatcher registration`);
        const file = join(process.cwd(), "commands", "catalog", ...Object.keys(catalogCategories)
            .filter(category => catalogCategories[category].includes(name))
            .map(category => category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")), `${name}.js`);
        assert.equal(existsSync(file), true, `${name} module file`);
    }
});

test("Menu 1 sends the entire catalog in one message with no separate menu fragments", async () => {
    const sent = [];
    await help({ sendMessage: async (...args) => sent.push(args) }, dummyMessage, []);
    assert.equal(sent.length, 1, "Menu 1 must be a single WhatsApp message");
    const payload = sent[0][1];
    const text = payload.text;
    assert.match(text, /MENU 1/);
    assert.ok(text.includes(MENU_TEMPLATE), "Menu 1 must include the exact complete command template");
    assert.match(text, /\.antibadword/);
    assert.match(text, /\.memegen/);
    assert.match(text, /\.tictactoe/);
    assert.match(text, /🌐 Info: https:\/\/marco-waqar-mini-bot-info-web\.vercel\.app/);
    assert.ok(payload.contextInfo?.externalAdReply?.thumbnail, "menu image should be an inline preview in the same message");
    assert.doesNotMatch(text, /Prefix: [!/]|no prefix/i);
});

test("catalog formatter supports numbered pages for long command categories", () => {
    const formatted = formatCatalogCategory("Fun", ["gayrate", "memegen"], ".", 2, 3);
    assert.match(formatted, /FUN COMMANDS · 2\/3/);
    assert.match(formatted, /📊 ➜ \*\.gayrate\*/);
    assert.match(formatted, /😂 ➜ \*\.memegen\*/);
});

test("Menu 2 sends every registered command and alias once in one message with the inline artwork", async () => {
    assert.equal(commands.menu2, menu2);
    const sent = [];
    await menu2({ sendMessage: async (...args) => sent.push(args) }, dummyMessage);
    assert.equal(sent.length, 1, "Menu 2 must not send its image, video, and command list as separate messages");
    const payload = sent[0][1] || {};
    assert.ok(payload.contextInfo?.externalAdReply?.thumbnail, "menu image should appear as an inline preview");
    assert.equal(payload.video, undefined, "the welcome video remains on the pairing welcome event, not a separate menu message");
    const rows = String(payload.text || "").split("\n").map(line => line.match(/^│ ➜ \.([a-z0-9_]+)$/)?.[1]).filter(Boolean);
    const listed = new Set(rows);
    assert.equal(rows.length, listed.size, "each menu entry should appear once");
    for (const name of Object.keys(commands)) assert.ok(listed.has(name), `Menu 2 must include .${name}`);
    for (const alias of Object.keys(COMMAND_ALIASES)) assert.ok(listed.has(alias), `Menu 2 must include alias .${alias}`);
    const text = getMenu2Template(".");
    assert.equal(MENU_TEMPLATE, text, "copy-ready template should stay in sync with the live menu");
    assert.ok(getMenuChunks().every(chunk => chunk.length <= 3500), "template chunks should stay WhatsApp-sized");
    assert.equal(getMenuChunks().join("\n\n"), MENU_TEMPLATE, "chunking must not remove or reorder sections");
    assert.match(text, /┌━━━━━━━━━━━━━━━━━━━━┐\n│ 🎮 GAMES COMMAND\n└━━━━━━━━━━━━━━━━━━━━┘/);
    assert.ok(text.split("\n\n").every(section => section.split("\n").slice(3).every(line => /^│ ➜ \.([a-z0-9_]+)$/u.test(line))));
    assert.doesNotMatch(text, /,|\*|•/u);
    assert.match(payload.text, /MENU 2/);
    assert.ok(payload.text.length < 60000, "complete menu fits in a single WhatsApp text message");
});

test("unsafe or unconfigured menu integrations explain their limitations instead of claiming success", async () => {
    const imagine = await commands.imagine({}, dummyMessage, []);
    const tts = await commands.tts({}, dummyMessage, []);
    const broadcast = await commands.broadcast({}, ownerMessage, []);
    assert.match(imagine, /not configured/i);
    assert.match(tts, /not configured/i);
    assert.match(broadcast, /disabled/i);
});

test("the secondary View Once shortcut does not attempt recovery for another sender", async () => {
    const reply = await commands.vv2({}, dummyMessage, []);
    assert.match(reply, /your own View Once/i);
});

test("meme and economy commands reach their real local handlers", async () => {
    const meme = await commands.memegen({}, dummyMessage, ["regression test"]);
    assert.ok(meme?.image, "memegen should return a generated image");
    assert.match(await commands.memesearch({}, dummyMessage, []), /meme idea/i);
    assert.match(await commands.economy({}, dummyMessage, []), /Balance:/);
});

test(".getpp handles a hidden profile photo without producing an invalid-URL error", async () => {
    const response = await commands.getpp({ profilePictureUrl: async () => null }, dummyMessage, []);
    assert.match(response, /unavailable or hidden/i);
});

test("AI roast reports a missing provider without throwing or making a network request", async () => {
    const names = ["GEMINI_API_KEY", "OPENAI_API_KEY", "AI_API_KEY"];
    const old = Object.fromEntries(names.map(name => [name, process.env[name]]));
    try {
        for (const name of names) delete process.env[name];
        const response = await commands.roastai({}, dummyMessage, ["a sleepy server"]);
        assert.match(response, /No AI provider is configured/i);
    } finally {
        for (const name of names) old[name] === undefined ? delete process.env[name] : process.env[name] = old[name];
    }
});
