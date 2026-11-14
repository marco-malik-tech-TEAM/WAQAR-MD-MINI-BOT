import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_shop = (sock, m, args) => runCatalogCommand("shop", sock, m, args);
