import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_fish = (sock, m, args) => runCatalogCommand("fish", sock, m, args);
