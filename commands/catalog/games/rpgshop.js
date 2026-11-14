import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_rpgshop = (sock, m, args) => runCatalogCommand("rpgshop", sock, m, args);
