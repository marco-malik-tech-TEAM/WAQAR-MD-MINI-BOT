import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_character = (sock, m, args) => runCatalogCommand("character", sock, m, args);
