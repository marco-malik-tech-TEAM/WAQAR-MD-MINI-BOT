import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_punch = (sock, m, args) => runCatalogCommand("punch", sock, m, args);
