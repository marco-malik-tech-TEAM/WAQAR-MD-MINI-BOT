import { runCatalogCommand } from "../../services/catalogCommands.js";

export const setstatusreply = (sock, m, args) => runCatalogCommand("setstatusreply", sock, m, args);
