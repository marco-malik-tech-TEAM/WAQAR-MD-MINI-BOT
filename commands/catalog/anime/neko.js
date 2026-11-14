import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_neko = (sock, m, args) => runCatalogCommand("neko", sock, m, args);
