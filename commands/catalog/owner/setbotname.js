import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_setbotname = (sock, m, args) => runCatalogCommand("setbotname", sock, m, args);
