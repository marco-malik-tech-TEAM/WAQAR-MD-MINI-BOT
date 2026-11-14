import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_mood = (sock, m, args) => runCatalogCommand("mood", sock, m, args);
