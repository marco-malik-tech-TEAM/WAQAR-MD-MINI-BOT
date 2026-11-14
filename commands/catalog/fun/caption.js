import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_caption = (sock, m, args) => runCatalogCommand("caption", sock, m, args);
