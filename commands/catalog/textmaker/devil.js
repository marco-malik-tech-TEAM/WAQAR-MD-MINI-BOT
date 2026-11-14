import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_devil = (sock, m, args) => runCatalogCommand("devil", sock, m, args);
