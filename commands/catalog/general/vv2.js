import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_vv2 = (sock, m, args) => runCatalogCommand("vv2", sock, m, args);
