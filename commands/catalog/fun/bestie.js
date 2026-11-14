import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_bestie = (sock, m, args) => runCatalogCommand("bestie", sock, m, args);
