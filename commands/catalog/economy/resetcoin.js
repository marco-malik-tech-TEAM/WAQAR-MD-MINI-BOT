import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_resetcoin = (sock, m, args) => runCatalogCommand("resetcoin", sock, m, args);
