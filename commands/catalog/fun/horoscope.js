import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_horoscope = (sock, m, args) => runCatalogCommand("horoscope", sock, m, args);
