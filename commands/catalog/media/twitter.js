import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_twitter = (sock, m, args) => runCatalogCommand("twitter", sock, m, args);
