import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_imagine = (sock, m, args) => runCatalogCommand("imagine", sock, m, args);
