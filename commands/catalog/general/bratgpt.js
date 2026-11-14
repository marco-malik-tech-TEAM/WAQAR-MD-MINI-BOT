import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_bratgpt = (sock, m, args) => runCatalogCommand("bratgpt", sock, m, args);
