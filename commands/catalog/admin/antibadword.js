import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_antibadword = (sock, m, args) => runCatalogCommand("antibadword", sock, m, args);
