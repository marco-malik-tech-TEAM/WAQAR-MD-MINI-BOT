import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_pick = (sock, m, args) => runCatalogCommand("pick", sock, m, args);
