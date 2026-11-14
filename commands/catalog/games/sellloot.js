import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_sellloot = (sock, m, args) => runCatalogCommand("sellloot", sock, m, args);
