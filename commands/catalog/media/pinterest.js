import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_pinterest = (sock, m, args) => runCatalogCommand("pinterest", sock, m, args);
