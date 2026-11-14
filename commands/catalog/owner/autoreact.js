import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_autoreact = (sock, m, args) => runCatalogCommand("autoreact", sock, m, args);
