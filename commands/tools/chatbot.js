import { getCachedConfig, updateConfig, invalidateConfigCache } from "../../services/configService.js";
import { getAIProviderOrder } from "../../services/aiProvider.js";
import { BRAND } from "../../brand.js";

const providersLabel = () => {
    const providers = getAIProviderOrder();
    return providers.length ? providers.join(", ") : "not configured";
};

export const chatbot = async (sock, message, args) => {
    const prefix = getCachedConfig().prefix || ".";
    const action = (args[0] || "status").toLowerCase();
    const config = getCachedConfig();
    const providers = providersLabel();

    if (!["on", "off", "status"].includes(action)) {
        return `🤖 *AI Chatbot Control*\n\nUsage: ${prefix}chatbot on | off | status\n\nProvider: ${providers}\n${BRAND.footer}`;
    }
    if (action === "status") {
        const groupMode = process.env.AI_AUTO_CHAT_GROUPS === "false" ? "disabled (private chats only)" : "enabled";
        return `🤖 *AI Chatbot Status*\n\nStatus: ${config.aiChatbotEnabled ? "ON" : "OFF"}\nProvider(s): ${providers}\nGroup auto-replies: ${groupMode}\n\nUse ${prefix}chatbot on/off to change the setting.\n${BRAND.footer}`;
    }
    if (action === "on" && providers === "not configured") {
        return `❌ No AI API is configured yet. Add one provider in Railway Variables first: GEMINI_API_KEY, OPENAI_API_KEY, or AI_API_KEY with AI_BASE_URL/AI_MODEL. Then run ${prefix}chatbot on again.`;
    }

    const enabled = action === "on";
    const explicitEnv = process.env.AI_AUTO_CHAT;
    if ((explicitEnv === "true" && !enabled) || (explicitEnv === "false" && enabled)) {
        return `⚙️ AI_AUTO_CHAT is explicitly set to ${explicitEnv} in Railway Variables, so it overrides this command. Change or clear that variable in Railway to use ${prefix}chatbot ${action}.`;
    }
    if (!updateConfig({ aiChatbotEnabled: enabled, aiChatbotManuallySet: true })) {
        return "❌ Could not save the chatbot setting. Check Railway storage permissions and try again.";
    }
    invalidateConfigCache();
    return `✅ AI chatbot is now *${enabled ? "ON" : "OFF"}*.\n${enabled ? "It will answer ordinary text in private chats and groups without a command." : "Automatic replies are paused."}\n\n${BRAND.footer}`;
};
