import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_myactivity = (sock, m, args) => runCatalogCommand("myactivity", sock, m, args);
