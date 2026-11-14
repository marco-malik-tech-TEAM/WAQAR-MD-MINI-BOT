import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_nhie = (sock, m, args) => runCatalogCommand("nhie", sock, m, args);
