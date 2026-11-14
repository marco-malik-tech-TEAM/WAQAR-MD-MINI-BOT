import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_igsf = (sock, m, args) => runCatalogCommand("igsf", sock, m, args);
