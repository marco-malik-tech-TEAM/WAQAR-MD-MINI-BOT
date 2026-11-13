import { join } from "path";
import { existsSync } from "fs";
import { BRAND } from "../brand.js";

let canvasLib = null;
let fontsReady = false;

/** Creates a "Welcome" card PNG buffer (like the screenshot). Returns null if canvas isn't available. */
export async function makeWelcomeCard({ groupName = "Group", name = "New member", number = "", avatar = null, count = 0, kind = "welcome" }) {
    try {
        if (!canvasLib) canvasLib = await import("@napi-rs/canvas");
        const { createCanvas, GlobalFonts, loadImage } = canvasLib;
        if (!fontsReady) {
            const f = join(process.cwd(), "assets", "fonts");
            if (existsSync(join(f, "DejaVuSans.ttf"))) GlobalFonts.registerFromPath(join(f, "DejaVuSans.ttf"), "BotFont");
            if (existsSync(join(f, "DejaVuSans-Bold.ttf"))) GlobalFonts.registerFromPath(join(f, "DejaVuSans-Bold.ttf"), "BotFontBold");
            fontsReady = true;
        }
        const W = 1280, H = 720;
        const c = createCanvas(W, H);
        const g = c.getContext("2d");
        const ascii = (s) => String(s).replace(/[^\x20-\x7E]/g, "").trim() || "Group";
        const cleanName = String(name || "New member").replace(/[\r\n<>]/g, " ").trim().slice(0, 80) || "New member";
        const initials = [...cleanName.split(/\s+/).slice(0, 2).map(part => [...part][0] || "")].join("").toUpperCase() || "?";
        const fitText = (text, font, maxWidth) => {
            g.font = font;
            let value = String(text || "");
            while (value.length > 2 && g.measureText(value).width > maxWidth) value = `${value.slice(0, -2)}…`;
            return value;
        };

        // background
        const bg = g.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0, "#04150f"); bg.addColorStop(1, "#06202a");
        g.fillStyle = bg; g.fillRect(0, 0, W, H);
        g.strokeStyle = "rgba(37,211,102,0.5)"; g.lineWidth = 3; g.strokeRect(14, 14, W - 28, H - 28);
        g.fillStyle = "rgba(37,211,102,0.08)"; g.beginPath(); g.arc(1100, 650, 260, 0, Math.PI * 2); g.fill();

        // left ring with member number
        const ring = g.createLinearGradient(90, 120, 420, 440);
        ring.addColorStop(0, "#25d366"); ring.addColorStop(1, "#00e5ff");
        g.lineWidth = 14; g.strokeStyle = ring; g.beginPath(); g.arc(255, 280, 160, 0, Math.PI * 2); g.stroke();
        g.fillStyle = "#0d3b2c"; g.beginPath(); g.arc(255, 280, 140, 0, Math.PI * 2); g.fill();
        g.save(); g.beginPath(); g.arc(255, 280, 132, 0, Math.PI * 2); g.clip();
        let avatarLoaded = false;
        if (avatar) {
            try {
                const image = await loadImage(avatar);
                const scale = Math.max(264 / image.width, 264 / image.height);
                const w = image.width * scale, h = image.height * scale;
                g.drawImage(image, 255 - w / 2, 280 - h / 2, w, h);
                avatarLoaded = true;
            } catch { /* use initials if the profile image is not a valid image */ }
        }
        if (!avatarLoaded) {
            g.fillStyle = "#0d3b2c"; g.fillRect(120, 145, 270, 270);
            g.fillStyle = "#25d366"; g.textAlign = "center"; g.font = "bold 104px BotFontBold"; g.fillText(initials, 255, 315);
        }
        g.restore();
        g.strokeStyle = "#25d366"; g.lineWidth = 2; g.strokeRect(135, 490, 240, 48);
        g.fillStyle = "#ffffff"; g.font = "bold 22px BotFontBold";
        g.fillText(kind === "welcome" ? "NEW MEMBER" : "MEMBER LEFT", 255, 523);
        g.fillStyle = "#25d366"; g.font = "bold 26px BotFontBold"; g.fillText(`#${count} Members`, 255, 590);

        // divider
        g.strokeStyle = "rgba(255,255,255,0.15)"; g.beginPath(); g.moveTo(480, 60); g.lineTo(480, 660); g.stroke();

        // right text
        g.textAlign = "left";
        g.fillStyle = "#25d366"; g.font = "bold 30px BotFontBold"; g.fillText(ascii(BRAND.short).slice(0, 26), 545, 105);
        g.fillStyle = "#c9d6d0"; g.font = "26px BotFont"; g.textAlign = "right"; g.fillText(kind === "welcome" ? "WELCOME" : "GOODBYE", 1215, 105); g.textAlign = "left";
        g.strokeStyle = "rgba(255,255,255,0.15)"; g.beginPath(); g.moveTo(545, 135); g.lineTo(1215, 135); g.stroke();
        g.fillStyle = "#ffffff"; g.font = "bold 58px BotFontBold"; g.fillText(kind === "welcome" ? "Welcome to" : "Goodbye", 545, 225);
        g.fillStyle = "#ffffff"; g.font = "bold 42px BotFontBold";
        g.fillText(fitText(cleanName, "bold 42px BotFontBold", 660), 545, 288);
        const num = g.createLinearGradient(545, 0, 1100, 0); num.addColorStop(0, "#25d366"); num.addColorStop(1, "#00e5ff");
        g.fillStyle = num; g.font = "bold 40px BotFontBold"; g.fillText(number ? `+${number}` : "Phone number unavailable", 545, 350);
        g.fillStyle = "#dfe9e4"; g.font = "28px BotFont";
        g.fillText(kind === "welcome" ? "You just joined an awesome community." : "We hope to see you again.", 545, 395);
        g.fillStyle = "#9db3aa"; g.font = "26px BotFont";
        if (kind === "welcome") {
            g.fillText("• Please read the group description & rules", 545, 450);
            g.fillText("• Respect everyone - no spam, no abuse", 545, 492);
            g.fillText("• Stay active and enjoy your stay", 545, 534);
            g.fillStyle = "#25d366"; g.font = "bold 30px BotFontBold"; g.fillText("→ Get started.", 545, 585);
        }
        g.fillStyle = "#7f948b"; g.font = "24px BotFont"; g.fillText("GROUP:", 545, 665);
        g.fillStyle = "#ffffff"; g.font = "bold 28px BotFontBold"; g.fillText(`< ${ascii(groupName).slice(0, 28)} />`, 650, 665);

        return c.toBuffer("image/png");
    } catch (e) {
        console.log("welcomeCard unavailable:", e.message);
        return null;
    }
}
