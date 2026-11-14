import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_pending = (sock, m, args) => runCatalogCommand("pending", sock, m, args);
