// Central brand/owner settings — edit here to change names everywhere
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export const BRAND = {
    name: "MARCO MALIK X",
    short: "MARCO MALIK X",
    version: "V1.0",
    website: "https://marco-waqar-mini-bot-info-web.vercel.app",
    owners: [
        { name: "Marco Malik", role: "Developer", age: 19, country: "Pakistan", city: "Rajanpur (District Rajanpur)", number: "923377857866" },
        { name: "Waqar Writes", role: "Developer", age: 21, country: "Pakistan", city: "Karachi", number: "923293245445" }
    ],
    footer: "💠 *Powered by MARCO MALIK X*"
};

export const OWNER_NUMBERS = BRAND.owners.map(o => o.number);

const asset = (f) => {
    try {
        const p = join(process.cwd(), "assets", f);
        return existsSync(p) ? readFileSync(p) : null;
    } catch { return null; }
};
export const getAsset = asset;

/** Public URL of THIS deployment (Railway) so the pairing page link is always correct */
export const getPairUrl = () => {
    const d = String(process.env.PUBLIC_URL || process.env.RAILWAY_PUBLIC_DOMAIN || process.env.RAILWAY_STATIC_URL || "").trim();
    if (!d) return null;
    try {
        const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(d) ? d : `https://${d}`);
        if (!['http:', 'https:'].includes(url.protocol)) return null;
        const path = url.pathname.replace(/\/+$/, "").replace(/\/pair$/i, "");
        url.pathname = `${path}/pair` || "/pair";
        url.search = "";
        url.hash = "";
        return url.toString().replace(/\/$/, "");
    } catch {
        return null;
    }
};
