import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_tts = (sock, m, args) => runCatalogCommand("tts", sock, m, args);
