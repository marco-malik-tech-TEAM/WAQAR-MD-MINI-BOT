import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_igs = (sock, m, args) => runCatalogCommand("igs", sock, m, args);
