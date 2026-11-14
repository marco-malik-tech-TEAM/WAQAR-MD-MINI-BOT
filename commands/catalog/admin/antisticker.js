import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_antisticker = (sock, m, args) => runCatalogCommand("antisticker", sock, m, args);
