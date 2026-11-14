import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_simage = (sock, m, args) => runCatalogCommand("simage", sock, m, args);
