import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_antitag = (sock, m, args) => runCatalogCommand("antitag", sock, m, args);
