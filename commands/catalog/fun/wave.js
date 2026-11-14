import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_wave = (sock, m, args) => runCatalogCommand("wave", sock, m, args);
