import { default as makeWASocket, DisconnectReason, useMultiFileAuthState, Browsers, delay } from "@whiskeysockets/baileys";
import pino from "pino";
import { join } from "path";
import { rmSync, mkdirSync, existsSync } from "fs";
import { randomBytes } from "crypto";
import { emitUpdate, getIO } from "./socketService.js";
import { getWaVersion } from "../utils/waVersion.js";

// Temp storage for active pairing sessions
const activePairingSessions = new Map();

const phoneFromSocket = (sock) => sock?.user?.id?.split("@")[0]?.split(":")[0]?.replace(/\D/g, "") || "";

const waitForConnectionOpen = (sock, timeoutMs = 45000) => {
    if (sock?.ws?.readyState === 1 && sock.user?.id) return Promise.resolve(sock);
    return new Promise((resolve, reject) => {
        let settled = false;
        const finish = (error) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            sock.ev.off("connection.update", onUpdate);
            error ? reject(error) : resolve(sock);
        };
        const onUpdate = ({ connection, lastDisconnect } = {}) => {
            if (connection === "open") finish();
            else if (connection === "close") {
                const code = lastDisconnect?.error?.output?.statusCode;
                const reason = lastDisconnect?.error?.message || "unknown disconnect reason";
                finish(new Error(`WhatsApp connection closed before becoming ready (${code ?? "no status code"}): ${reason}`));
            }
        };
        const timer = setTimeout(() => finish(new Error("Timed out waiting for the WhatsApp session to reconnect.")), timeoutMs);
        sock.ev.on("connection.update", onUpdate);
        if (sock?.ws?.readyState === 1 && sock.user?.id) finish();
    });
};

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
        let pairingHandled = false;
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
                    if (pairingHandled) return;
                    pairingHandled = true;
                    console.log(`✅ [${sessionId}] Connected Successfully!`);
                    try {
                        await safeSaveCreds();
                        await delay(1000);

                        const pairedNumber = phoneFromSocket(sock);
                        if (!pairedNumber) throw new Error("Could not determine the paired WhatsApp number.");

                        const { getClient } = await import("./whatsappClient.js");
                        const currentMain = getClient();
                        const mainIsAlreadyOnlineForThisNumber = phoneFromSocket(currentMain) === pairedNumber && currentMain?.ws?.readyState === 1;

                        if (!mainIsAlreadyOnlineForThisNumber) {
                            const { SESSIONS_ACTIVE, startSession } = await import("./whatsappClient.js");
                            const { cpSync, mkdirSync: mk } = await import("fs");
                            const target = join(SESSIONS_ACTIVE, pairedNumber);
                            mk(SESSIONS_ACTIVE, { recursive: true });
                            rmSync(target, { recursive: true, force: true });
                            cpSync(sessionDir, target, { recursive: true });
                            console.log(`[${sessionId}] Starting persistent session for ${pairedNumber}`);

                            // This pairing socket is temporary. Do not report its planned shutdown as a pairing failure.
                            sock.__intentionalClose = true;
                            const persistentSock = await startSession(pairedNumber);
                            await waitForConnectionOpen(persistentSock);
                        } else {
                            console.log(`[${sessionId}] The main bot socket is already online for ${pairedNumber}.`);
                            sock.__intentionalClose = true;
                        }

                        notify("pairing_success", {
                            sessionId,
                            message: "Pairing is complete and the bot connection is online."
                        });
                        activePairingSessions.delete(sessionId);
                        try { sock.end(undefined); } catch { }
                        if (existsSync(sessionDir)) rmSync(sessionDir, { recursive: true, force: true });
                    } catch (e) {
                        console.error(`[${sessionId}] Pairing completed but the persistent bot session did not become ready:`, e);
                        notify("pairing_error", {
                            sessionId,
                            error: "WhatsApp accepted pairing, but the bot's persistent connection did not become ready. Check Railway logs and persistent storage, then retry if needed."
                        });
                        sock.__intentionalClose = true;
                        try { sock.end(undefined); } catch { }
                    }
                }

                if (connection === "close") {
                    const code = lastDisconnect?.error?.output?.statusCode;
                    const reason = lastDisconnect?.error?.message || "Unknown Error";

                    console.warn(`[${sessionId}] Connection closed: ${code} - ${reason}`);

                    if (sock.__intentionalClose || pairingHandled) {
                        activePairingSessions.delete(sessionId);
                        if (existsSync(sessionDir)) rmSync(sessionDir, { recursive: true, force: true });
                        return;
                    }

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
