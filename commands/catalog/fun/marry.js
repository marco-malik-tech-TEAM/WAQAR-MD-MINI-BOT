import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_marry = (sock, m, args) => runCatalogCommand("marry", sock, m, args);
