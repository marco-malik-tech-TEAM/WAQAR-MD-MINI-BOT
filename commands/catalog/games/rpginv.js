import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_rpginv = (sock, m, args) => runCatalogCommand("rpginv", sock, m, args);
