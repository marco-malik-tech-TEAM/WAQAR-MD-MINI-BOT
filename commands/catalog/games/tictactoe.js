import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_tictactoe = (sock, m, args) => runCatalogCommand("tictactoe", sock, m, args);
