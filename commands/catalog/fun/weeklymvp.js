import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_weeklymvp = (sock, m, args) => runCatalogCommand("weeklymvp", sock, m, args);
