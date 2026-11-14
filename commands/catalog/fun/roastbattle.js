import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_roastbattle = (sock, m, args) => runCatalogCommand("roastbattle", sock, m, args);
