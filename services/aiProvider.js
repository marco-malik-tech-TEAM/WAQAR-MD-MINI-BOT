import axios from "axios";
import { BRAND } from "../brand.js";

export const AI_SYSTEM_PROMPT = `You are ${BRAND.name} AI, a friendly, professional assistant inside a WhatsApp bot. Reply in the same language and script as the user. Be clear, respectful, accurate, and concise. Do not claim to have performed actions you did not perform. Keep replies under 2500 characters.`;

const value = name => String(process.env[name] || "").trim();
const normalizedProvider = () => {
    const provider = value("AI_PROVIDER").toLowerCase();
    return ["auto", "gemini", "openai", "custom"].includes(provider) ? provider : "auto";
};

export function getAIProviderOrder() {
    const configured = normalizedProvider();
    const providers = {
        gemini: Boolean(value("GEMINI_API_KEY")),
        openai: Boolean(value("OPENAI_API_KEY")),
        custom: Boolean(value("AI_API_KEY"))
    };
    const preference = configured === "auto" ? ["gemini", "openai", "custom"] : [configured, "gemini", "openai", "custom"];
    return [...new Set(preference)].filter(name => providers[name]);
}

export const hasAIProvider = () => getAIProviderOrder().length > 0;

const userMessages = history => history
    .filter(item => (item.role === "user" || item.role === "assistant") && typeof item.content === "string" && item.content.trim())
    .slice(-12);

async function requestGemini(history) {
    const key = value("GEMINI_API_KEY");
    const model = value("GEMINI_MODEL") || "gemini-2.5-flash";
    const contents = userMessages(history).map(item => ({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: item.content }]
    }));
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const { data } = await axios.post(url, {
        system_instruction: { parts: [{ text: AI_SYSTEM_PROMPT }] },
        contents,
        generationConfig: { maxOutputTokens: 700, temperature: 0.7 }
    }, {
        timeout: 45000,
        headers: { "x-goog-api-key": key, "Content-Type": "application/json" }
    });
    return data?.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("").trim();
}

async function requestOpenAI(history) {
    const key = value("OPENAI_API_KEY");
    const model = value("OPENAI_MODEL") || "gpt-4o-mini";
    const messages = [{ role: "system", content: AI_SYSTEM_PROMPT }, ...userMessages(history)];
    const { data } = await axios.post("https://api.openai.com/v1/chat/completions", {
        model,
        messages,
        max_tokens: 700,
        temperature: 0.7
    }, {
        timeout: 45000,
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }
    });
    return data?.choices?.[0]?.message?.content?.trim();
}

async function requestCustom(history) {
    const key = value("AI_API_KEY");
    const base = (value("AI_BASE_URL") || "https://api.openai.com/v1").replace(/\/+$/, "");
    const model = value("AI_MODEL") || "gpt-4o-mini";
    const { data } = await axios.post(`${base}/chat/completions`, {
        model,
        messages: [{ role: "system", content: AI_SYSTEM_PROMPT }, ...userMessages(history)],
        max_tokens: 700,
        temperature: 0.7
    }, {
        timeout: 45000,
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }
    });
    return data?.choices?.[0]?.message?.content?.trim();
}

const REQUESTS = { gemini: requestGemini, openai: requestOpenAI, custom: requestCustom };

export async function generateAIResponse(history) {
    const providers = getAIProviderOrder();
    if (!providers.length) {
        throw new Error("No AI provider is configured. Add GEMINI_API_KEY, OPENAI_API_KEY, or AI_API_KEY to Railway Variables.");
    }
    const failures = [];
    for (const provider of providers) {
        try {
            const answer = await REQUESTS[provider](history);
            if (typeof answer === "string" && answer.trim()) return answer.trim();
            failures.push(`${provider}: empty response`);
        } catch (error) {
            const status = error.response?.status;
            failures.push(`${provider}: ${status || error.code || error.message || "request failed"}`);
            console.warn(`[AI] ${provider} provider failed${status ? ` (${status})` : ""}.`);
        }
    }
    throw new Error(`All configured AI providers failed: ${failures.join("; ")}`);
}
