import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_handhold = (sock, m, args) => runCatalogCommand("handhold", sock, m, args);
