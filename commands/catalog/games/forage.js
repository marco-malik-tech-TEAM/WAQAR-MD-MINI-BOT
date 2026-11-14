import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_forage = (sock, m, args) => runCatalogCommand("forage", sock, m, args);
