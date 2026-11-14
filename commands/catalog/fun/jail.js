import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_jail = (sock, m, args) => runCatalogCommand("jail", sock, m, args);
