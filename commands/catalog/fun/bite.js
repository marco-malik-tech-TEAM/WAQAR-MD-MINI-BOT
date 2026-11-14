import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_bite = (sock, m, args) => runCatalogCommand("bite", sock, m, args);
