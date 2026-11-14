import { runCatalogCommand } from "../../../services/catalogCommands.js";

export const cmd_howgay = (sock, m, args) => runCatalogCommand("howgay", sock, m, args);
