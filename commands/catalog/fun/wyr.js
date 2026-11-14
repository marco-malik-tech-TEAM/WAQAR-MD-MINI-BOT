import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_wyr = (sock, m, args) => runCatalogCommand("wyr", sock, m, args);
