import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_leaves = (sock, m, args) => runCatalogCommand("leaves", sock, m, args);
