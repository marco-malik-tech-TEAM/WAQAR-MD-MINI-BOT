import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_iqrate = (sock, m, args) => runCatalogCommand("iqrate", sock, m, args);
