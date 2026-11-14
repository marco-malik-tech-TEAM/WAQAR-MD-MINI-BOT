import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_autolevelup = (sock, m, args) => runCatalogCommand("autolevelup", sock, m, args);
