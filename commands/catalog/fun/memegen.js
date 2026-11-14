import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_memegen = (sock, m, args) => runCatalogCommand("memegen", sock, m, args);
