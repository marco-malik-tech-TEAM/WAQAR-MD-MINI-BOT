import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_neon = (sock, m, args) => runCatalogCommand("neon", sock, m, args);
