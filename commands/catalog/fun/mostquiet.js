import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_mostquiet = (sock, m, args) => runCatalogCommand("mostquiet", sock, m, args);
