import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_ice = (sock, m, args) => runCatalogCommand("ice", sock, m, args);
