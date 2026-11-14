import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_enemy = (sock, m, args) => runCatalogCommand("enemy", sock, m, args);
