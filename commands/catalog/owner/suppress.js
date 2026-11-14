import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_suppress = (sock, m, args) => runCatalogCommand("suppress", sock, m, args);
