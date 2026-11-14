import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_economy = (sock, m, args) => runCatalogCommand("economy", sock, m, args);
