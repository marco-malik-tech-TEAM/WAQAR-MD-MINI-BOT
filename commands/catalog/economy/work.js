import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_work = (sock, m, args) => runCatalogCommand("work", sock, m, args);
