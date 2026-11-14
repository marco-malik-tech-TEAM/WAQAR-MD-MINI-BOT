import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_zoom = (sock, m, args) => runCatalogCommand("zoom", sock, m, args);
