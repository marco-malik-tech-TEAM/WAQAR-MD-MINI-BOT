import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_guessnumber = (sock, m, args) => runCatalogCommand("guessnumber", sock, m, args);
