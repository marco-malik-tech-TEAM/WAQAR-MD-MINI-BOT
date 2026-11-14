import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_getpp = (sock, m, args) => runCatalogCommand("getpp", sock, m, args);
