import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_mode = (sock, m, args) => runCatalogCommand("mode", sock, m, args);
