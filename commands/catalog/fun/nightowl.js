import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_nightowl = (sock, m, args) => runCatalogCommand("nightowl", sock, m, args);
