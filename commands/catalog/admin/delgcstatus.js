import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_delgcstatus = (sock, m, args) => runCatalogCommand("delgcstatus", sock, m, args);
