import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_choose = (sock, m, args) => runCatalogCommand("choose", sock, m, args);
