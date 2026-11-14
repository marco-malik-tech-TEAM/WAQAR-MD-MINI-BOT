import test from "node:test";
import assert from "node:assert/strict";
import axios from "axios";
import { generateAIResponse, getAIProviderOrder } from "../services/aiProvider.js";
import { isGroupAutoChatEnabled } from "../services/aiChatbot.js";
import { resolveAIChatbotEnabled } from "../services/configService.js";
import { commands } from "../commands/index.js";

test("AI providers support Gemini, OpenAI, and an OpenAI-compatible custom endpoint", async () => {
    const names = ["AI_PROVIDER", "GEMINI_API_KEY", "GEMINI_MODEL", "OPENAI_API_KEY", "OPENAI_MODEL", "AI_API_KEY", "AI_BASE_URL", "AI_MODEL"];
    const previous = Object.fromEntries(names.map(name => [name, process.env[name]]));
    const originalPost = axios.post;
    const calls = [];
    try {
        for (const name of names) delete process.env[name];
        process.env.AI_PROVIDER = "auto";
        process.env.GEMINI_API_KEY = "test-gemini-key";
        process.env.OPENAI_API_KEY = "test-openai-key";
        process.env.AI_API_KEY = "test-compatible-key";
        process.env.AI_BASE_URL = "https://compatible.example/v1";
        process.env.AI_MODEL = "compatible-model";
        assert.deepEqual(getAIProviderOrder(), ["gemini", "openai", "custom"]);

        axios.post = async (url, body, options) => {
            calls.push({ url, body, options });
            if (url.includes("generativelanguage.googleapis.com")) {
                return { data: { candidates: [{ content: { parts: [{ text: "Gemini reply" }] } }] } };
            }
            return { data: { choices: [{ message: { content: "Compatible reply" } }] } };
        };

        process.env.AI_PROVIDER = "gemini";
        assert.equal(await generateAIResponse([{ role: "user", content: "Hello" }]), "Gemini reply");
        assert.equal(calls[0].options.headers["x-goog-api-key"], "test-gemini-key");
        assert.equal(calls[0].body.contents[0].role, "user");
        assert.ok(calls[0].body.system_instruction.parts[0].text.length > 0);

        process.env.AI_PROVIDER = "custom";
        assert.equal(await generateAIResponse([{ role: "user", content: "Hello" }]), "Compatible reply");
        assert.equal(calls[1].url, "https://compatible.example/v1/chat/completions");
        assert.equal(calls[1].options.headers.Authorization, "Bearer test-compatible-key");
        assert.equal(calls[1].body.model, "compatible-model");
    } finally {
        axios.post = originalPost;
        for (const name of names) {
            if (previous[name] === undefined) delete process.env[name];
            else process.env[name] = previous[name];
        }
    }
});

test("chatbot owner toggle is registered among bot commands", () => {
    assert.equal(typeof commands.chatbot, "function");
    assert.equal(typeof commands.ai, "function");
});

test("group auto-replies are enabled by default and can be explicitly disabled", () => {
    const previous = process.env.AI_AUTO_CHAT_GROUPS;
    try {
        delete process.env.AI_AUTO_CHAT_GROUPS;
        assert.equal(isGroupAutoChatEnabled(), true);
        process.env.AI_AUTO_CHAT_GROUPS = "false";
        assert.equal(isGroupAutoChatEnabled(), false);
        process.env.AI_AUTO_CHAT_GROUPS = "true";
        assert.equal(isGroupAutoChatEnabled(), true);
    } finally {
        if (previous === undefined) delete process.env.AI_AUTO_CHAT_GROUPS;
        else process.env.AI_AUTO_CHAT_GROUPS = previous;
    }
});

test("a provider key enables auto-chat despite legacy defaults, but explicit owner and Railway toggles win", () => {
    assert.equal(resolveAIChatbotEnabled({ aiChatbotEnabled: false }, { GEMINI_API_KEY: "configured" }), true);
    assert.equal(resolveAIChatbotEnabled({ aiChatbotEnabled: false, aiChatbotManuallySet: true }, { GEMINI_API_KEY: "configured" }), false);
    assert.equal(resolveAIChatbotEnabled({ aiChatbotEnabled: true, aiChatbotManuallySet: true }, { AI_AUTO_CHAT: "false", OPENAI_API_KEY: "configured" }), false);
    assert.equal(resolveAIChatbotEnabled({}, { AI_AUTO_CHAT: "true" }), true);
});
