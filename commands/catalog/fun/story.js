import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_story = (sock, m, args) => runCatalogCommand("story", sock, m, args);
