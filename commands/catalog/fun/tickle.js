import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_tickle = (sock, m, args) => runCatalogCommand("tickle", sock, m, args);
