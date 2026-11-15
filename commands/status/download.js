import { runStatusDownloadCommand } from "../../services/catalogCommands.js";

export const statusDownload = (sock, m) => runStatusDownloadCommand(sock, m);
