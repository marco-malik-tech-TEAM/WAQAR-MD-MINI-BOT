import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_poke = (sock, m, args) => runCatalogCommand("poke", sock, m, args);
