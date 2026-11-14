import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_takepack = (sock, m, args) => runCatalogCommand("takepack", sock, m, args);
