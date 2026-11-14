import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_autosticker = (sock, m, args) => runCatalogCommand("autosticker", sock, m, args);
