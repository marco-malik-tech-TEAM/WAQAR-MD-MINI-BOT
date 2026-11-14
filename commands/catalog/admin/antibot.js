import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_antibot = (sock, m, args) => runCatalogCommand("antibot", sock, m, args);
