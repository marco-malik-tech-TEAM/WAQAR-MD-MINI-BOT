import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_debate = (sock, m, args) => runCatalogCommand("debate", sock, m, args);
