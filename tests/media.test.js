import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { createCanvas } from "@napi-rs/canvas";
import { detectSite, firstUrl, tiktokDownload } from "../utils/downloader.js";
import { tiktok } from "../commands/media/social.js";
import { makeWelcomeCard } from "../services/welcomeCard.js";

test("media URLs are classified for the user's YouTube, TikTok, Instagram, and Facebook routes", () => {
    assert.equal(detectSite("https://www.youtube.com/watch?v=abcdefghijk"), "youtube");
    assert.equal(detectSite("https://www.tiktok.com/@creator/video/1234567890"), "tiktok");
    assert.equal(detectSite("https://www.instagram.com/reel/ABC123/"), "instagram");
    assert.equal(detectSite("https://www.facebook.com/watch/?v=123"), "facebook");
    assert.equal(detectSite("https://example.org/video"), "generic");
});

test("URL extraction trims trailing sentence punctuation without damaging query strings", () => {
    assert.equal(firstUrl("video https://www.instagram.com/reel/ABC123/."), "https://www.instagram.com/reel/ABC123/");
    assert.equal(firstUrl("song https://youtu.be/abcdefghijk?t=12"), "https://youtu.be/abcdefghijk?t=12");
    assert.equal(firstUrl("no URL here"), undefined);
});

test("the TikTok social command can import its required downloader export", async () => {
    assert.equal(typeof tiktok, "function");
    await assert.rejects(tiktokDownload("https://example.org/not-tiktok"), /valid HTTPS TikTok link/i);
});

test("bundled yt-dlp is executable in the deployment checkout", async () => {
    const binary = resolve("bin/yt-dlp");
    const version = await new Promise((resolvePromise, reject) => {
        const child = spawn(binary, ["--version"]);
        let output = "";
        child.stdout.on("data", chunk => { output += chunk.toString(); });
        child.once("error", reject);
        child.once("close", code => code === 0 ? resolvePromise(output.trim()) : reject(new Error(`yt-dlp exited with ${code}`)));
    });
    assert.match(version, /^\d{4}\.\d{2}\.\d{2}$/);
});

test("welcome card renders with supplied display name, phone, and profile image", async () => {
    const avatarCanvas = createCanvas(64, 64);
    const avatarContext = avatarCanvas.getContext("2d");
    avatarContext.fillStyle = "#25d366";
    avatarContext.fillRect(0, 0, 64, 64);
    const avatar = avatarCanvas.toBuffer("image/png");
    const card = await makeWelcomeCard({
        groupName: "Test Group",
        name: "Test Member",
        number: "15551234567",
        avatar,
        count: 12,
        kind: "welcome"
    });
    assert.ok(Buffer.isBuffer(card));
    assert.equal(card.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert.ok(card.length > 10_000);
});
