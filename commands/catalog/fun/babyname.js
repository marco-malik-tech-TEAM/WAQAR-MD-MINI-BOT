import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_babyname = (sock, m, args) => runCatalogCommand("babyname", sock, m, args);
