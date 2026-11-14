import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_take = (sock, m, args) => runCatalogCommand("take", sock, m, args);
