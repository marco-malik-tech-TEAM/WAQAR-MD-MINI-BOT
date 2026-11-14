import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_resetbalance = (sock, m, args) => runCatalogCommand("resetbalance", sock, m, args);
