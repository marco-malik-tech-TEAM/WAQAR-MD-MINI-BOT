import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const CONFIG_PATH = join(process.cwd(), "config.json");
const AUTH_DIR = join(process.cwd(), "auth_info");

// Default configuration for a fresh bot
const DEFAULT_CONFIG = {
    phone: "",
    name: "Bot User",
    autoLikeStatus: false,
    antiDelete: false,
    antiCall: false,
    antiViewOnce: false,
    antiRemove: false,
    autoReadMessages: false,
    autoViewStatus: false,
    alwaysTyping: false,
    alwaysRecording: false,
    alwaysOnline: false,
    aiChatbotEnabled: false,
    prefix: ".",
    ownerNumber: "923377857866"
};

export function resolveAIChatbotEnabled(fileConfig = {}, env = process.env) {
    if (env.AI_AUTO_CHAT === "true") return true;
    if (env.AI_AUTO_CHAT === "false") return false;
    if (fileConfig.aiChatbotManuallySet === true) return fileConfig.aiChatbotEnabled === true;
    const hasAIProviderKey = ["GEMINI_API_KEY", "OPENAI_API_KEY", "AI_API_KEY"]
        .some(name => Boolean(String(env[name] || "").trim()));
    return hasAIProviderKey || fileConfig.aiChatbotEnabled === true;
}

// Ensure auth directory exists
if (!existsSync(AUTH_DIR)) {
    mkdirSync(AUTH_DIR, { recursive: true });
}

/**
 * Load configuration from local JSON file
 */
export function loadConfig() {
    let fileConfig = {};
    try {
        if (existsSync(CONFIG_PATH)) {
            const data = readFileSync(CONFIG_PATH, "utf-8");
            fileConfig = JSON.parse(data);
        }
    } catch (err) {
        console.error("❌ Failed to load config.json:", err.message);
    }

    // Merge defaults -> file config -> explicit Railway AI_AUTO_CHAT override.
    return {
        ...DEFAULT_CONFIG,
        ...fileConfig,
        phone: process.env.PHONE || fileConfig.phone || DEFAULT_CONFIG.phone,
        ownerNumber: process.env.OWNER_NUMBER || fileConfig.ownerNumber || DEFAULT_CONFIG.ownerNumber,
        prefix: process.env.PREFIX || fileConfig.prefix || DEFAULT_CONFIG.prefix,
        aiChatbotEnabled: resolveAIChatbotEnabled(fileConfig)
    };
}

/**
 * Save configuration to local JSON file
 */
export function saveConfig(config) {
    try {
        writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
        console.log("✅ Config saved successfully");
        return true;
    } catch (err) {
        console.error("❌ Failed to save config.json:", err.message);
        return false;
    }
}

/**
 * Update specific settings in the config
 */
export function updateConfig(updates) {
    const config = loadConfig();
    const newConfig = { ...config, ...updates };
    return saveConfig(newConfig);
}

/**
 * Get a specific setting from config
 */
export function getSetting(key) {
    const config = loadConfig();
    return config[key];
}

// In-memory cache for performance
let configCache = null;
let configCacheTime = 0;
const CACHE_TTL = 5000; // 5 seconds

/**
 * Get cached config for performance
 */
export function getCachedConfig() {
    const now = Date.now();
    if (!configCache || (now - configCacheTime > CACHE_TTL)) {
        configCache = loadConfig();
        configCacheTime = now;
    }
    return configCache;
}

/**
 * Invalidate config cache (call after updates)
 */
export function invalidateConfigCache() {
    configCache = null;
    configCacheTime = 0;
}

export const AUTH_INFO_PATH = AUTH_DIR;
