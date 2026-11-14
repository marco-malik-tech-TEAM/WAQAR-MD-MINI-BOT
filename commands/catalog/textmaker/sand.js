import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_sand = (sock, m, args) => runCatalogCommand("sand", sock, m, args);
