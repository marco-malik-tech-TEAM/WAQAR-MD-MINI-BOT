import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_divorce = (sock, m, args) => runCatalogCommand("divorce", sock, m, args);
