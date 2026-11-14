import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_role = (sock, m, args) => runCatalogCommand("role", sock, m, args);
