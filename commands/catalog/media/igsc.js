import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_igsc = (sock, m, args) => runCatalogCommand("igsc", sock, m, args);
