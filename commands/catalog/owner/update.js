import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_update = (sock, m, args) => runCatalogCommand("update", sock, m, args);
