import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_rpg = (sock, m, args) => runCatalogCommand("rpg", sock, m, args);
