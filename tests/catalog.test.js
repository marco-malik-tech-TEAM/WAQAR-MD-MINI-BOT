import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { commands } from "../commands/index.js";
import { catalogCommands, catalogCategories } from "../commands/catalog/index.js";
import { help, formatCatalogCategory } from "../commands/general/help.js";
import { menu2 } from "../commands/general/menu2.js";

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

test("help menu lists additional catalog commands by category", async () => {
    const sent = [];
    const result = await help({ sendMessage: async (...args) => sent.push(args) }, dummyMessage, []);
    const text = typeof result === "string" ? result : sent.map(args => args[1]?.text || args[1]?.caption || "").join("\n");
    assert.match(text, /164 additional commands/);
    assert.match(text, /\.antibadword/);
    assert.match(text, /\.memegen/);
    assert.match(text, /\.tictactoe/);
    const categoryMessages = sent.map(args => args[1]?.text || "").filter(value => value.includes("COMMANDS"));
    assert.ok(categoryMessages.length >= 10);
    assert.ok(categoryMessages.every(value => value.split("\n").some(line => /^│ .+ ➜ \*\./u.test(line))));
    assert.doesNotMatch(categoryMessages.join("\n"), /\.attp, \.bratgpt/);
});

test("catalog formatter supports numbered pages for long command categories", () => {
    const formatted = formatCatalogCategory("Fun", ["gayrate", "memegen"], ".", 2, 3);
    assert.match(formatted, /FUN COMMANDS · 2\/3/);
    assert.match(formatted, /📊 ➜ \*\.gayrate\*/);
    assert.match(formatted, /😂 ➜ \*\.memegen\*/);
});

test("Menu 2 includes menu artwork, the bundled welcome video and every registered command once", async () => {
    assert.equal(commands.menu2, menu2);
    const sent = [];
    await menu2({ sendMessage: async (...args) => sent.push(args) }, dummyMessage);
    const payloads = sent.map(args => args[1] || {});
    assert.ok(payloads.some(payload => payload.image), "menu image should be attached");
    assert.ok(payloads.some(payload => payload.video), "welcome video should be attached");
    const rows = payloads.flatMap(payload => String(payload.text || "").split("\n").map(line => line.match(/➜ \*\.([^*]+)\*/)?.[1]).filter(Boolean));
    const listed = new Set(rows);
    assert.equal(rows.length, listed.size, "each menu entry should appear once");
    for (const name of Object.keys(commands)) assert.ok(listed.has(name), `Menu 2 must include .${name}`);
    assert.ok(listed.has("menu"), "the original .menu alias should be listed");
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
