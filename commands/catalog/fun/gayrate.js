import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_gayrate = (sock, m, args) => runCatalogCommand("gayrate", sock, m, args);
