import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_glitch = (sock, m, args) => runCatalogCommand("glitch", sock, m, args);
