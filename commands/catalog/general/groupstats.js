import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_groupstats = (sock, m, args) => runCatalogCommand("groupstats", sock, m, args);
