import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_bomb = (sock, m, args) => runCatalogCommand("bomb", sock, m, args);
