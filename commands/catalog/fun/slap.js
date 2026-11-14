import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_slap = (sock, m, args) => runCatalogCommand("slap", sock, m, args);
