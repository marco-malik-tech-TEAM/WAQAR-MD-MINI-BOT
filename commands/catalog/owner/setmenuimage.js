import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_setmenuimage = (sock, m, args) => runCatalogCommand("setmenuimage", sock, m, args);
