import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_sudo = (sock, m, args) => runCatalogCommand("sudo", sock, m, args);
