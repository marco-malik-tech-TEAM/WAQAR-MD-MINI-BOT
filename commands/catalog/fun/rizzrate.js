import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_rizzrate = (sock, m, args) => runCatalogCommand("rizzrate", sock, m, args);
