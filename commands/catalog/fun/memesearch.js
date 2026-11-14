import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_memesearch = (sock, m, args) => runCatalogCommand("memesearch", sock, m, args);
