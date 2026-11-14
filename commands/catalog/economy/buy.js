import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_buy = (sock, m, args) => runCatalogCommand("buy", sock, m, args);
