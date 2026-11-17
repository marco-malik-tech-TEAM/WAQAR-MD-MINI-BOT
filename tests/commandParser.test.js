import test from "node:test";
import assert from "node:assert/strict";
import { parseDotCommand } from "../services/commandParser.js";

test("commands require a leading dot; bare names and alternate prefixes are ordinary text", () => {
    for (const text of ["help", "menu", "play song", "!help", "/help", "#help", "  ping  "]) {
        assert.equal(parseDotCommand(text), null, `${text} must not be parsed as a command`);
    }
});

test("dot-prefixed command and arguments are normalized", () => {
    assert.deepEqual(parseDotCommand(".PLAY  never gonna give you up"), {
        name: "play",
        args: ["never", "gonna", "give", "you", "up"]
    });
    assert.deepEqual(parseDotCommand(".menu"), { name: "menu", args: [] });
    assert.equal(parseDotCommand("."), null);
});
