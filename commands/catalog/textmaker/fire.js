import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_fire = (sock, m, args) => runCatalogCommand("fire", sock, m, args);
