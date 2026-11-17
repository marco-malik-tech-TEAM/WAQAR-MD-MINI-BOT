import test from "node:test";
import assert from "node:assert/strict";
import { BRAND, getPairUrl } from "../brand.js";
import { buildWelcomeText } from "../services/welcome.js";
import { buildUnifiedMenuText } from "../commands/general/menuSender.js";

const names = ["PUBLIC_URL", "RAILWAY_PUBLIC_DOMAIN", "RAILWAY_STATIC_URL"];

function withEnv(values, callback) {
    const old = Object.fromEntries(names.map(name => [name, process.env[name]]));
    try {
        for (const name of names) {
            if (values[name] === undefined) delete process.env[name];
            else process.env[name] = values[name];
        }
        return callback();
    } finally {
        for (const name of names) old[name] === undefined ? delete process.env[name] : process.env[name] = old[name];
    }
}

test("pairing URL uses the configured custom domain or Railway public domain", () => {
    withEnv({ PUBLIC_URL: "https://bot.example.com/", RAILWAY_PUBLIC_DOMAIN: "other.up.railway.app" }, () => {
        assert.equal(getPairUrl(), "https://bot.example.com/pair");
    });
    withEnv({ RAILWAY_PUBLIC_DOMAIN: "waqar.up.railway.app" }, () => {
        assert.equal(getPairUrl(), "https://waqar.up.railway.app/pair");
    });
});

test("no deployment domain never falls back to the information website", () => {
    withEnv({}, () => assert.equal(getPairUrl(), null));
    assert.doesNotMatch(BRAND.footer, /https?:\/\//i);
});

test("the information-site link is rendered in the menu, not in the pairing welcome or footer", () => {
    const menu = buildUnifiedMenuText("MENU 1");
    const welcome = buildWelcomeText(".");
    assert.equal(menu.split(BRAND.website).length - 1, 1);
    assert.doesNotMatch(welcome, new RegExp(BRAND.website.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.doesNotMatch(BRAND.footer, new RegExp(BRAND.website.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});
