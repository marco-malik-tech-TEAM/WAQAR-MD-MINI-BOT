import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_hacker = (sock, m, args) => runCatalogCommand("hacker", sock, m, args);
