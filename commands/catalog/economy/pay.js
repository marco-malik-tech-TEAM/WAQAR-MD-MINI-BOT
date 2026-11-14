import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_pay = (sock, m, args) => runCatalogCommand("pay", sock, m, args);
