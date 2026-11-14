import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_antispam = (sock, m, args) => runCatalogCommand("antispam", sock, m, args);
