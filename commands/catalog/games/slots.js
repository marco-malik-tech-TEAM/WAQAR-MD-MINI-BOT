import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_slots = (sock, m, args) => runCatalogCommand("slots", sock, m, args);
