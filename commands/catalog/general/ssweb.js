import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_ssweb = (sock, m, args) => runCatalogCommand("ssweb", sock, m, args);
