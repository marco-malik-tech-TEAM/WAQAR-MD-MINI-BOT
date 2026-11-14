import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_clean = (sock, m, args) => runCatalogCommand("clean", sock, m, args);
