import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_topcoins = (sock, m, args) => runCatalogCommand("topcoins", sock, m, args);
