import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_random = (sock, m, args) => runCatalogCommand("random", sock, m, args);
