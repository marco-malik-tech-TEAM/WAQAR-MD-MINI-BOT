import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_afk = (sock, m, args) => runCatalogCommand("afk", sock, m, args);
