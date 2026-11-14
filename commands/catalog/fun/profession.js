import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_profession = (sock, m, args) => runCatalogCommand("profession", sock, m, args);
