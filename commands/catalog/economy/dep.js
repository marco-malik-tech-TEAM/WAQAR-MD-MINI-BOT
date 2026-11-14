import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_dep = (sock, m, args) => runCatalogCommand("dep", sock, m, args);
