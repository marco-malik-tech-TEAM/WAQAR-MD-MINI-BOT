import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_horse = (sock, m, args) => runCatalogCommand("horse", sock, m, args);
