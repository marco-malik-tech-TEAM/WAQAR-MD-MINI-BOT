import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_toxicrate = (sock, m, args) => runCatalogCommand("toxicrate", sock, m, args);
