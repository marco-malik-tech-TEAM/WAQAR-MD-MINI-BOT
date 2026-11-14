import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_hangman = (sock, m, args) => runCatalogCommand("hangman", sock, m, args);
