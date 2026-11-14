import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_hunt = (sock, m, args) => runCatalogCommand("hunt", sock, m, args);
