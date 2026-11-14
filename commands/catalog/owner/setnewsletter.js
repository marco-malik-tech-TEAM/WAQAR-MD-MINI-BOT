import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_setnewsletter = (sock, m, args) => runCatalogCommand("setnewsletter", sock, m, args);
