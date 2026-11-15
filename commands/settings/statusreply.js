import { runCatalogCommand } from "../../services/catalogCommands.js";

export const statusreply = (sock, m, args) => runCatalogCommand("statusreply", sock, m, args);
