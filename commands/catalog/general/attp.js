import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_attp = (sock, m, args) => runCatalogCommand("attp", sock, m, args);
