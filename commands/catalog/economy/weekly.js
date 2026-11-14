import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_weekly = (sock, m, args) => runCatalogCommand("weekly", sock, m, args);
