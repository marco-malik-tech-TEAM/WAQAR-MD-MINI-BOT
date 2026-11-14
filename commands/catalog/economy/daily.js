import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_daily = (sock, m, args) => runCatalogCommand("daily", sock, m, args);
