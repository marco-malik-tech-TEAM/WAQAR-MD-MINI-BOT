import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_antigroupstatus = (sock, m, args) => runCatalogCommand("antigroupstatus", sock, m, args);
