import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_pies = (sock, m, args) => runCatalogCommand("pies", sock, m, args);
