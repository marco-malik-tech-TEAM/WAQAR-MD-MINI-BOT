import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_crime = (sock, m, args) => runCatalogCommand("crime", sock, m, args);
