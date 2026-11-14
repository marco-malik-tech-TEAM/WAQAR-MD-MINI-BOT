import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_resetdi = (sock, m, args) => runCatalogCommand("resetdi", sock, m, args);
