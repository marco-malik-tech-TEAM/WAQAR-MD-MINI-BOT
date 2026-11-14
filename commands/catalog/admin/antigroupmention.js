import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_antigroupmention = (sock, m, args) => runCatalogCommand("antigroupmention", sock, m, args);
