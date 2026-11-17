/**
 * ESM command adapter for the supplied .vv.js file.
 * Recovery, media download fallbacks, size limits, and ownership verification
 * remain centralized in viewonce.js so this alias cannot bypass privacy checks.
 */
import { recoverViewOnce } from "./viewonce.js";

export async function vvCommand(sock, message) {
    return recoverViewOnce(sock, message);
}

export default vvCommand;
