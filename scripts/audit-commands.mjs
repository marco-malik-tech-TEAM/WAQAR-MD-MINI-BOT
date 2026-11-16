import axios from "axios";
import { mkdtempSync, rmSync, symlinkSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const previousCwd = process.cwd();
const auditDir = mkdtempSync(join(tmpdir(), "waqar-command-audit-"));
const reportPath = resolve(projectRoot, "docs/COMMAND_STATUS.md");
const offlineError = () => Promise.reject(new Error("Offline command audit: external network disabled."));
const axiosOriginals = { get: axios.get, post: axios.post, put: axios.put, patch: axios.patch, delete: axios.delete, create: axios.create };
const fetchOriginal = globalThis.fetch;
const setTimeoutOriginal = globalThis.setTimeout;
const clearTimeoutOriginal = globalThis.clearTimeout;
const consoleOriginals = { error: console.error, warn: console.warn, log: console.log };

try {
    if (existsSync(join(projectRoot, "assets"))) symlinkSync(join(projectRoot, "assets"), join(auditDir, "assets"), "dir");
    process.chdir(auditDir);
    process.env.OFFLINE_COMMAND_AUDIT = "1";
    axios.get = offlineError;
    axios.post = offlineError;
    axios.put = offlineError;
    axios.patch = offlineError;
    axios.delete = offlineError;
    axios.create = function (...args) {
        const client = axiosOriginals.create.apply(this, args);
        client.get = offlineError;
        client.post = offlineError;
        client.put = offlineError;
        client.patch = offlineError;
        client.delete = offlineError;
        return client;
    };
    globalThis.fetch = offlineError;
    // Fast-forward deliberate animation sleeps during this offline smoke run.
    globalThis.setTimeout = (callback, delay, ...args) => setTimeoutOriginal(callback, Math.min(Number(delay) || 0, 1), ...args);

    const [{ commands }, { COMMAND_ALIASES }] = await Promise.all([
        import(pathToFileURL(join(projectRoot, "commands/index.js")).href),
        import(pathToFileURL(join(projectRoot, "services/commandAliases.js")).href)
    ]);

    const chatJid = "120363000000000000@g.us";
    const userJid = "15550001111@s.whatsapp.net";
    const sent = [];
    const sock = new Proxy({
        user: { id: "15550009999:1@s.whatsapp.net", name: "Audit Bot" },
        sendMessage: async (...args) => { sent.push(args); return { key: { id: "offline-audit" } }; },
        groupMetadata: async () => ({ subject: "Offline Audit", participants: [{ id: userJid, admin: "admin" }, { id: "15550009999@s.whatsapp.net", admin: "admin" }] }),
        groupFetchAllParticipating: async () => ({}),
        groupInviteCode: async () => "offline-code",
        profilePictureUrl: async () => null,
        updateMediaMessage: async value => value,
        readMessages: async () => {},
        presenceSubscribe: async () => {},
        sendPresenceUpdate: async () => {},
        groupSettingUpdate: async () => {},
        groupParticipantsUpdate: async () => {},
        groupUpdateSubject: async () => {},
        groupUpdateDescription: async () => {},
        groupLeave: async () => {},
        updateBlockStatus: async () => {},
        logout: async () => {},
        end: async () => {},
        ev: { on: () => {}, emit: () => {} }
    }, { get(target, key) { return key in target ? target[key] : undefined; } });

    const results = [];
    for (const name of Object.keys(commands).sort()) {
        const message = {
            key: { remoteJid: chatJid, participant: userJid, id: `audit-${name}`, fromMe: false },
            message: { conversation: `.${name}` },
            pushName: "Offline Audit",
            messageTimestamp: Math.floor(Date.now() / 1000)
        };
        let watchdog;
        const capturedLogs = [];
        try {
            console.log = (...args) => capturedLogs.push(args.map(value => String(value?.message || value)).join(" ").slice(0, 200));
            console.error = (...args) => capturedLogs.push(args.map(value => String(value?.message || value)).join(" ").slice(0, 200));
            console.warn = (...args) => capturedLogs.push(args.map(value => String(value?.message || value)).join(" ").slice(0, 200));
            const returned = await Promise.race([
                Promise.resolve().then(() => commands[name](sock, message, [])),
                new Promise((_, reject) => { watchdog = setTimeoutOriginal(() => reject(new Error("Offline smoke timed out after 20 seconds.")), 20000); })
            ]);
            const response = typeof returned === "string" ? returned.replace(/\s+/g, " ").trim() : "handler completed";
            const rawSummary = `${response}${capturedLogs.length ? `; log: ${capturedLogs.join(" | ").slice(0, 120)}` : ""}`.slice(0, 240);
            const summary = rawSummary.replace(/(?<![A-Za-z0-9_])\+?\d[\d ()-]{7,}\d(?![A-Za-z0-9_])/g, "[number redacted]").slice(0, 180);
            const conditional = /not configured|not available|unavailable|failed to (?:fetch|send|create|download|connect)|temporarily unavailable|offline command audit|invalid url|not found|not implemented/i.test(summary);
            results.push({ name, status: conditional ? "CONDITIONAL" : "PASS", summary });
        } catch (error) {
            results.push({ name, status: "FAIL", summary: String(error?.message || error).replace(/\s+/g, " ").slice(0, 160) });
        } finally {
            console.error = consoleOriginals.error;
            console.warn = consoleOriginals.warn;
            console.log = consoleOriginals.log;
            if (watchdog) clearTimeoutOriginal(watchdog);
        }
    }

    const aliasResults = Object.entries(COMMAND_ALIASES).sort(([a], [b]) => a.localeCompare(b)).map(([alias, target]) => ({
        alias,
        target,
        status: typeof commands[target] === "function" ? "PASS" : "FAIL"
    }));

    const passCount = results.filter(item => item.status === "PASS").length;
    const conditionalCount = results.filter(item => item.status === "CONDITIONAL").length;
    const failCount = results.filter(item => item.status === "FAIL").length;
    const aliasPass = aliasResults.filter(item => item.status === "PASS").length;
    const moduleFiles = [];
    const walk = async dir => {
        const { readdirSync } = await import("node:fs");
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
            const full = join(dir, entry.name);
            if (entry.isDirectory()) await walk(full);
            else if (entry.isFile() && entry.name.endsWith(".js")) moduleFiles.push(full);
        }
    };
    await walk(join(projectRoot, "commands"));
    const catalogCount = moduleFiles.filter(file => file.includes(`${join("commands", "catalog")}${process.platform === "win32" ? "\\" : "/"}`) && !file.endsWith(`${process.platform === "win32" ? "\\" : "/"}index.js`)).length;

    const lines = [
        "# Command handler smoke audit",
        "",
        `Generated at ${new Date().toISOString()} by \`node scripts/audit-commands.mjs\`.`,
        "",
        `Registered handlers: **${results.length}** (${passCount} passed, ${conditionalCount} conditional, ${failCount} failed). Supported aliases: **${aliasResults.length}** (${aliasPass} target checks passed). JavaScript files under \`commands/\`: **${moduleFiles.length}**; individual catalog wrappers: **${catalogCount}**.`,
        "",
        "> Scope: each handler was invoked once with no arguments using a mocked WhatsApp socket and disabled network calls. Deliberate animation delays were fast-forwarded. PASS means the local handler completed without an uncaught exception. CONDITIONAL means the result indicates an unavailable provider, missing configuration, permissions, or input needed for a real run. FAIL means an uncaught exception or timeout. This smoke run does not certify live APIs, credentials, media access, or every command-specific input. No WhatsApp message or third-party request was sent by this audit.",
        "",
        "## Registered command handlers",
        "",
        "| Command | Offline smoke | Result/response excerpt |",
        "|---|---|---|",
        ...results.map(item => `| \`.${item.name}\` | ${item.status} | ${item.summary.replaceAll("|", "\\|")} |`),
        "",
        "## Shortcut aliases",
        "",
        "| Alias | Dispatch target | Target registered |",
        "|---|---|---|",
        ...aliasResults.map(item => `| \`.${item.alias}\` | \`.${item.target}\` | ${item.status} |`),
        ""
    ];

    const { writeFileSync, mkdirSync } = await import("node:fs");
    mkdirSync(dirname(reportPath), { recursive: true });
    writeFileSync(reportPath, lines.join("\n"), "utf8");
    console.log(`Wrote ${reportPath}`);
    console.log(`Handlers: ${passCount} passed, ${conditionalCount} conditional, ${failCount} failed; aliases: ${aliasPass}/${aliasResults.length} registered targets.`);
    if (failCount) process.exitCode = 1;
} finally {
    process.chdir(previousCwd);
    axios.get = axiosOriginals.get;
    axios.post = axiosOriginals.post;
    axios.put = axiosOriginals.put;
    axios.patch = axiosOriginals.patch;
    axios.delete = axiosOriginals.delete;
    axios.create = axiosOriginals.create;
    globalThis.fetch = fetchOriginal;
    globalThis.setTimeout = setTimeoutOriginal;
    globalThis.clearTimeout = clearTimeoutOriginal;
    console.error = consoleOriginals.error;
    console.warn = consoleOriginals.warn;
    console.log = consoleOriginals.log;
    delete process.env.OFFLINE_COMMAND_AUDIT;
    rmSync(auditDir, { recursive: true, force: true });
}
