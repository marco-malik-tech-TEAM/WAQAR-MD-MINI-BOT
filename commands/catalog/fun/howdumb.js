import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_howdumb = (sock, m, args) => runCatalogCommand("howdumb", sock, m, args);
