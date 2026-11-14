import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_roulette = (sock, m, args) => runCatalogCommand("roulette", sock, m, args);
