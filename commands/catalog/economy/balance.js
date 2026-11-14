import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_balance = (sock, m, args) => runCatalogCommand("balance", sock, m, args);
