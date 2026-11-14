import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_light = (sock, m, args) => runCatalogCommand("light", sock, m, args);
