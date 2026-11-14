import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_bonk = (sock, m, args) => runCatalogCommand("bonk", sock, m, args);
