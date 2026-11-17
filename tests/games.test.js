import test from "node:test";
import assert from "node:assert/strict";
import { commands } from "../commands/index.js";

const message = (chat, sender) => ({
    key: { remoteJid: chat, participant: sender, id: `${chat}-${sender}-${Date.now()}-${Math.random()}` },
    message: { conversation: ".tictactoe" }
});

test("game commands that were reported disabled now return safe playable rounds", async () => {
    const chat = "games-regression@g.us";
    const m = message(chat, "player1@s.whatsapp.net");
    for (const command of ["bomb", "bet", "horse", "slots", "roulette"]) {
        const response = await commands[command]({}, m, []);
        assert.equal(typeof response, "string", `.${command} should respond`);
        assert.doesNotMatch(response, /disabled|not enabled/i, `.${command} should not silently fail`);
    }
});

test("Tic-Tac-Toe accepts two players, validates turns, and completes a win", async () => {
    const chat = "ttt-regression@g.us";
    const x = message(chat, "player-x@s.whatsapp.net");
    const o = message(chat, "player-o@s.whatsapp.net");
    assert.match(await commands.tictactoe({}, x, ["start"]), /starts as X/);
    assert.match(await commands.tictactoe({}, o, ["join"]), /joined as O/);
    assert.match(await commands.tictactoe({}, x, ["1"]), /Next: O/);
    assert.match(await commands.tictactoe({}, o, ["4"]), /Next: X/);
    assert.match(await commands.tictactoe({}, x, ["2"]), /Next: O/);
    assert.match(await commands.tictactoe({}, o, ["5"]), /Next: X/);
    assert.match(await commands.tictactoe({}, x, ["3"]), /X wins/);
});
