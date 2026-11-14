import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_mostactive = (sock, m, args) => runCatalogCommand("mostactive", sock, m, args);
