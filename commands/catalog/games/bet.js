import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_bet = (sock, m, args) => runCatalogCommand("bet", sock, m, args);
