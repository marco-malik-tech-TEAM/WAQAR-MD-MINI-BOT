import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_konachan = (sock, m, args) => runCatalogCommand("konachan", sock, m, args);
