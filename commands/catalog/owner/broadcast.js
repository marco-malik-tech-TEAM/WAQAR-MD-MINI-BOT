import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_broadcast = (sock, m, args) => runCatalogCommand("broadcast", sock, m, args);
