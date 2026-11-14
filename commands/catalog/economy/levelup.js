import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_levelup = (sock, m, args) => runCatalogCommand("levelup", sock, m, args);
