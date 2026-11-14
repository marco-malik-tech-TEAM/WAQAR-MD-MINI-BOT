import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_roastoftheday = (sock, m, args) => runCatalogCommand("roastoftheday", sock, m, args);
