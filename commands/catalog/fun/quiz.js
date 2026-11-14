import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_quiz = (sock, m, args) => runCatalogCommand("quiz", sock, m, args);
