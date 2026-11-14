import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_kiss = (sock, m, args) => runCatalogCommand("kiss", sock, m, args);
