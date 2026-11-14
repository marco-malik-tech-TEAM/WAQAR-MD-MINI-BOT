import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_delete = (sock, m, args) => runCatalogCommand("delete", sock, m, args);
