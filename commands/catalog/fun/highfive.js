import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_highfive = (sock, m, args) => runCatalogCommand("highfive", sock, m, args);
