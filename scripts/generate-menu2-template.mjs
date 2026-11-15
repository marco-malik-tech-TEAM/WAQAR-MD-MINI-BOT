import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { getMenu2Template } from "../commands/general/menu2.js";

const here = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(here, "../MENU2_TEMPLATE.js");
const menu = getMenu2Template(".");
const literal = menu.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
const source = `// Generated from the live command registry. Edit the menu source and regenerate with:\n// node scripts/generate-menu2-template.mjs\nexport const MENU_TEMPLATE = \`${literal}\`;\n\nconst sections = MENU_TEMPLATE.split("\\n\\n");\n\nexport function getMenuChunks(maxChars = 3500) {\n    const chunks = [];\n    let current = "";\n    for (const section of sections) {\n        const next = current ? \`${"${current}"}\\n\\n\${section}\` : section;\n        if (current && next.length > maxChars) {\n            chunks.push(current);\n            current = section;\n        } else {\n            current = next;\n        }\n    }\n    if (current) chunks.push(current);\n    return chunks;\n}\n\nexport async function sendMenuTemplate(sock, jid, quoted) {\n    for (const text of getMenuChunks()) {\n        await sock.sendMessage(jid, { text }, quoted ? { quoted } : undefined);\n    }\n}\n\nexport default MENU_TEMPLATE;\n`;
writeFileSync(outputPath, source, "utf8");
console.log(`Generated ${outputPath} (${menu.split("\n").length} lines).`);
