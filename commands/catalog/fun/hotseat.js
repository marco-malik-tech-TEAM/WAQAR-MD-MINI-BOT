import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_hotseat = (sock, m, args) => runCatalogCommand("hotseat", sock, m, args);
