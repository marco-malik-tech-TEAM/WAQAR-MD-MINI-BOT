import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_chop = (sock, m, args) => runCatalogCommand("chop", sock, m, args);
