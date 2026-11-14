import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_ytvideo = (sock, m, args) => runCatalogCommand("ytvideo", sock, m, args);
