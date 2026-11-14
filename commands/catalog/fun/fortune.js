import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_fortune = (sock, m, args) => runCatalogCommand("fortune", sock, m, args);
