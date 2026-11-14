import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_wd = (sock, m, args) => runCatalogCommand("wd", sock, m, args);
