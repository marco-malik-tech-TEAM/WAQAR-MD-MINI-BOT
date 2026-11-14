import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_setbotpp = (sock, m, args) => runCatalogCommand("setbotpp", sock, m, args);
