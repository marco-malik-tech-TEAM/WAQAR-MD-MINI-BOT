import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_groupstatus = (sock, m, args) => runCatalogCommand("groupstatus", sock, m, args);
