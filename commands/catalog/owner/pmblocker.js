import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_pmblocker = (sock, m, args) => runCatalogCommand("pmblocker", sock, m, args);
