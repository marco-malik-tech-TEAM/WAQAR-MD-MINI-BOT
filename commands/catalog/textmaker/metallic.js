import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_metallic = (sock, m, args) => runCatalogCommand("metallic", sock, m, args);
