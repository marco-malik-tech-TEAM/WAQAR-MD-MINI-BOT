import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_thunder = (sock, m, args) => runCatalogCommand("thunder", sock, m, args);
