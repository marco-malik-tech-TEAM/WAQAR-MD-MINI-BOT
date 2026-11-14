import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_crop = (sock, m, args) => runCatalogCommand("crop", sock, m, args);
