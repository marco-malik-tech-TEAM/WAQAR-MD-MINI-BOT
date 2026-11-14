import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_mentionking = (sock, m, args) => runCatalogCommand("mentionking", sock, m, args);
