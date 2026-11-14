import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_feed = (sock, m, args) => runCatalogCommand("feed", sock, m, args);
