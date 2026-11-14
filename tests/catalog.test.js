import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { commands } from "../commands/index.js";
import { catalogCommands, catalogCategories } from "../commands/catalog/index.js";
import { help } from "../commands/general/help.js";

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
