import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_rpgbuy = (sock, m, args) => runCatalogCommand("rpgbuy", sock, m, args);
