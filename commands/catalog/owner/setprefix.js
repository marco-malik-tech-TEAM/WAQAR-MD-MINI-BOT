import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_setprefix = (sock, m, args) => runCatalogCommand("setprefix", sock, m, args);
