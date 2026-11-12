import { default as makeWASocket, DisconnectReason, useMultiFileAuthState, Browsers, delay } from "@whiskeysockets/baileys";
import pino from "pino";
import { join } from "path";
import { rmSync, mkdirSync, existsSync, readFileSync } from "fs";
import { randomBytes } from "crypto";
import { emitUpdate, getIO } from "./socketService.js";
import { sendWelcome } from "./welcome.js";
import { getWaVersion } from "../utils/waVersion.js";

// Temp storage for active pairing sessions
const activePairingSessions = new Map();

/**
 * Generate a unique Session ID
 */
const generateSessionId = () => {
    return "MARCOWAQAR-" + randomBytes(4).toString("hex").toUpperCase();
};

/**
 * Start a pairing session
 * @param {string} phoneNumber - User's phone number (optional for QR)
 * @param {string} method - "qr" or "code"
 * @param {string} socketId - Socket.IO client ID for targeted updates
 */
export const startPairing = async (phoneNumber, method = "qr", socketId, hooks = {}) => {
    const notify = (event, data) => {
        emitUpdateToSocket(socketId, event, data);
        try { hooks.onEvent?.(event, data); } catch { /* ignore */ }
    };
    console.log(`🔌 Requesting pairing for ${phoneNumber} (${method}) via socketId: ${socketId}`);

    try {
        const sessionId = generateSessionId();
        const sessionDir = join(process.cwd(), "sessions", sessionId);

        if (existsSync(sessionDir)) {
            rmSync(sessionDir, { recursive: true, force: true });
        }
        mkdirSync(sessionDir, { recursive: true });

        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        let pairRetries = 0;
        const maxPairRetries = 5;
        const browserList = () => [Browsers.ubuntu("Chrome"), Browsers.macOS("Safari"), Browsers.windows("Edge"), Browsers.macOS("Chrome"), Browsers.ubuntu("Firefox"), Browsers.windows("Chrome")];

        const initializeSocket = async () => {
            console.log(`🔌 [${sessionId}] Initializing socket... (Attempt ${pairRetries + 1})`);

            const waVersion = await getWaVersion();
            const sock = makeWASocket({
                logger: pino({ level: "silent" }),
                auth: state,
                ...(waVersion ? { version: waVersion } : {}),
                browser: browserList()[pairRetries % 6],
                printQRInTerminal: false,
                markOnlineOnConnect: false,
                generateHighQualityLinkPreview: false,
                syncFullHistory: false,
                connectTimeoutMs: 60000,
                defaultQueryTimeoutMs: 0,
                keepAliveIntervalMs: 10000
            });

            // Store session ref
            activePairingSessions.set(sessionId, { sock, socketId, phone: phoneNumber });

            // Handle Pairing Code
            if (method === "code" && phoneNumber) {
                (async () => {
                    try {
                        console.log(`[${sessionId}] Initiating pairing code request chain...`);
                        let attempts = 0;
                        const maxAttempts = 5;
                        let success = false;

                        while (attempts < maxAttempts && !success) {
                            attempts++;
                            try {
                                const waitTime = attempts === 1 ? 6000 : 3000;
                                await delay(waitTime);

                                if (!sock.authState.creds.me && !sock.authState.creds.registered) {
                                    console.log(`[${sessionId}] Requesting pairing code (Attempt ${attempts})...`);
                                    const code = await sock.requestPairingCode(phoneNumber.replace(/\D/g, ""));
                                    console.log(`[${sessionId}] ✅ Pairing Code Generated: ${code}`);
                                    notify("pairing_code", { code, sessionId });
                                    success = true;
                                } else {
                                    success = true;
                                }
                            } catch (e) {
                                const isTransient = e.message?.includes("Connection Closed") || e.output?.statusCode === 428;
                                console.warn(`[${sessionId}] Pairing code attempt ${attempts} failed: ${e.message}`);
                                if (attempts >= maxAttempts || !isTransient) throw e;
                                await delay(4000);
                            }
                        }
                    } catch (error) {
                        console.error(`[${sessionId}] ❌ Permanent failure generating pairing code:`, error);
                        notify("pairing_error", {
                            error: "Neural Link Failed: Connection was closed by WhatsApp. Please ensure your number is correct and try again.",
                            sessionId
                        });
                    }
                })();
            }

            const safeSaveCreds = async () => {
                try {
                    if (!existsSync(sessionDir)) mkdirSync(sessionDir, { recursive: true });
                    await saveCreds();
                } catch (e) {
                    console.warn(`[${sessionId}] saveCreds failed: ${e.message}`);
                }
            };

            sock.ev.on("creds.update", safeSaveCreds);

            sock.ev.on("connection.update", async (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr && method === "qr") {
                    console.log(`[${sessionId}] QR Generated`);
                    notify("qr_update", { qr, sessionId });
                }

                if (connection === "open") {
                    console.log(`✅ [${sessionId}] Connected Successfully!`);
                    await delay(2000);

                    let sessionData = "";
                    try {
                        const credsPath = join(sessionDir, "creds.json");
                        const creds = JSON.parse(readFileSync(credsPath).toString());
                        const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
                        sessionData = "MARCOWAQAR-" + Buffer.from(JSON.stringify({ creds, expiresAt })).toString("base64");
                    } catch (e) {
                        console.error(`[${sessionId}] Failed to read creds:`, e);
                    }

                    try {
                        const userJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
                        const messageText = sessionData;
                        await sock.sendMessage(userJid, { text: messageText });
                        console.log(`[${sessionId}] Session ID sent to user DM: ${userJid}`);
                        // Welcome video right after successful connection
                        try { await sendWelcome(sock, userJid, "."); } catch (we) { console.error(`[${sessionId}] Welcome send failed:`, we.message); }
                    } catch (msgErr) {
                        console.error(`[${sessionId}] Failed to send DM:`, msgErr);
                    }

                    notify("pairing_success", {
                        sessionId,
                        message: "Pairing Successful! Check your WhatsApp DM for the Session ID."
                    });

                    await delay(5000);
                    const pairedNumber = sock.user?.id?.split(":")[0]?.split("@")[0];
                    try { sock.end(undefined); } catch { }
                    activePairingSessions.delete(sessionId);

                    // Keep the user's session ALIVE inside this server (multi-session), so their bot runs now
                    try {
                        const { getCachedConfig: gcc } = await import("./configService.js");
                        if (pairedNumber && pairedNumber !== gcc().phone && existsSync(join(sessionDir, "creds.json"))) {
                            const { SESSIONS_ACTIVE, startSession } = await import("./whatsappClient.js");
                            const { cpSync, mkdirSync: mk, writeFileSync: wf } = await import("fs");
                            const target = join(SESSIONS_ACTIVE, pairedNumber);
                            mk(SESSIONS_ACTIVE, { recursive: true });
                            rmSync(target, { recursive: true, force: true });
                            cpSync(sessionDir, target, { recursive: true });
                            wf(join(target, ".welcome_sent"), String(Date.now())); // welcome already sent above
                            console.log(`[${sessionId}] ➕ Starting permanent session for ${pairedNumber}`);
                            setTimeout(() => startSession(pairedNumber).catch(e => console.error("startSession:", e.message)), 3000);
                        }
                    } catch (ke) { console.error(`[${sessionId}] Could not keep session:`, ke.message); }

                    if (existsSync(sessionDir)) {
                        rmSync(sessionDir, { recursive: true, force: true });
                    }
                }

                if (connection === "close") {
                    const code = lastDisconnect?.error?.output?.statusCode;
                    const reason = lastDisconnect?.error?.message || "Unknown Error";

                    console.warn(`[${sessionId}] Connection closed: ${code} - ${reason}`);

                    if ([515, 405, 428, 408, 500, 503].includes(code) && pairRetries < maxPairRetries) {
                        pairRetries++;
                        console.log(`[${sessionId}] 🔄 Connection closed (${code}), retrying with another browser profile (${pairRetries}/${maxPairRetries})...`);
                        try { sock.end(undefined); } catch { }
                        await delay(2500);
                        return initializeSocket();
                    }

                    let errorMessage = "Connection Closed (Reason: " + code + ")";
                    if (code === DisconnectReason.loggedOut) errorMessage = "Device logged out/disconnected.";
                    else if (code === DisconnectReason.connectionClosed) errorMessage = "Connection was closed by server. Try again.";
                    else if (code === DisconnectReason.connectionLost) errorMessage = "Network link lost. Check your internet.";
                    else if (code === DisconnectReason.timedOut) errorMessage = "Connection timed out. Please retry.";
                    else if (code === 401) errorMessage = "Unauthorized. Please scan a fresh code.";
                    else if (code === 408) errorMessage = "Uplink Request Timed Out (408). Check your signal.";
                    else if (code === 405) errorMessage = "WhatsApp refused the connection (405) from this server. Please try again in a minute or use the QR option.";
                    else if (code === 515) errorMessage = "Stream Error (515). The server detected a conflict. Retrying terminal advised.";

                    notify("pairing_error", {
                        error: errorMessage,
                        sessionId,
                        statusCode: code
                    });

                    activePairingSessions.delete(sessionId);
                    rmSync(sessionDir, { recursive: true, force: true });
                }
            });

            return sock;
        };

        await initializeSocket();

        // Cleanup timeout
        setTimeout(() => {
            if (activePairingSessions.has(sessionId)) {
                console.log(`[${sessionId}] Session timed out (120s cleanup reached)`);
                const session = activePairingSessions.get(sessionId);
                session?.sock?.end();
                activePairingSessions.delete(sessionId);
                if (existsSync(sessionDir)) {
                    rmSync(sessionDir, { recursive: true, force: true });
                }
            }
        }, 120 * 1000);

        return { sessionId };

    } catch (error) {
        console.error("Critical Error in startPairing:", error);
        throw new Error(`Pairing Initialization Failed: ${error.message}`);
    }
};

const emitUpdateToSocket = (socketId, event, data) => {
    try {
        const io = getIO();
        io.emit(event, data);
        console.log(`📡 BROADCAST_EMIT: ${event} -> Data:`, JSON.stringify(data));
        if (socketId) {
            console.log(`📡 (Target was: ${socketId})`);
        }
    } catch (e) {
        console.error("Socket emit error:", e.message);
    }
};
