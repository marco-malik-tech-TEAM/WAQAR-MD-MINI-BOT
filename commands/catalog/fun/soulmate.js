import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_soulmate = (sock, m, args) => runCatalogCommand("soulmate", sock, m, args);
