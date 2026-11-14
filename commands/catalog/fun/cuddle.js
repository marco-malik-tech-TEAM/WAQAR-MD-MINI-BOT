import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_cuddle = (sock, m, args) => runCatalogCommand("cuddle", sock, m, args);
