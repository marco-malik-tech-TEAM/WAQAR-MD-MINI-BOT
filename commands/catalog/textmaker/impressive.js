import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_impressive = (sock, m, args) => runCatalogCommand("impressive", sock, m, args);
