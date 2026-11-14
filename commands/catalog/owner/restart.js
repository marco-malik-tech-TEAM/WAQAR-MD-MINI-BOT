import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_restart = (sock, m, args) => runCatalogCommand("restart", sock, m, args);
