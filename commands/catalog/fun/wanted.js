import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_wanted = (sock, m, args) => runCatalogCommand("wanted", sock, m, args);
