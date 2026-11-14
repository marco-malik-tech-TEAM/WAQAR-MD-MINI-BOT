import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_snow = (sock, m, args) => runCatalogCommand("snow", sock, m, args);
