import { runCatalogCommand } from "../../services/catalogCommands.js";

export const setownername = (sock, m, args) => runCatalogCommand("setownername", sock, m, args);
