import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_vs = (sock, m, args) => runCatalogCommand("vs", sock, m, args);
