import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_newsletter = (sock, m, args) => runCatalogCommand("newsletter", sock, m, args);
