import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_arena = (sock, m, args) => runCatalogCommand("arena", sock, m, args);
