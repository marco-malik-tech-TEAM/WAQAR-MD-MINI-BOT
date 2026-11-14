import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_savestatus = (sock, m, args) => runCatalogCommand("savestatus", sock, m, args);
