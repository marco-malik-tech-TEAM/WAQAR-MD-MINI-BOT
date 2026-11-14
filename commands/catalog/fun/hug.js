import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_hug = (sock, m, args) => runCatalogCommand("hug", sock, m, args);
