import { catalogCategories } from "../catalog/index.js";
import { commands } from "../index.js";
import { COMMAND_ALIASES } from "../../services/commandAliases.js";
import { buildMenuSections, renderMenuTemplate } from "./menu2-template.js";
import { sendUnifiedMenu } from "./menuSender.js";

export function getMenu2Sections() {
    return buildMenuSections({ commands, catalogCategories, aliases: COMMAND_ALIASES });
}

/** Complete all-command menu as one editable, ready-to-send template string. */
export function getMenu2Template(prefix = ".") {
    return renderMenuTemplate(getMenu2Sections(), prefix);
}

export async function menu2(sock, message) {
    return sendUnifiedMenu(sock, message, "MENU 2");
}
