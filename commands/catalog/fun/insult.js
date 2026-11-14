import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_insult = (sock, m, args) => runCatalogCommand("insult", sock, m, args);
