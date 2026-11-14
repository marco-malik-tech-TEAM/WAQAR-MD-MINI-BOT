import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_autostatus = (sock, m, args) => runCatalogCommand("autostatus", sock, m, args);
