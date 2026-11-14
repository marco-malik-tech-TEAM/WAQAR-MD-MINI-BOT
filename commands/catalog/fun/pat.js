import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_pat = (sock, m, args) => runCatalogCommand("pat", sock, m, args);
