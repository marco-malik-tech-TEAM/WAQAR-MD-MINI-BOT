import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_roastai = (sock, m, args) => runCatalogCommand("roastai", sock, m, args);
