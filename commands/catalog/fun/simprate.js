import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_simprate = (sock, m, args) => runCatalogCommand("simprate", sock, m, args);
