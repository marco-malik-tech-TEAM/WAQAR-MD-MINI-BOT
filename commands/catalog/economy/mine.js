import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_mine = (sock, m, args) => runCatalogCommand("mine", sock, m, args);
