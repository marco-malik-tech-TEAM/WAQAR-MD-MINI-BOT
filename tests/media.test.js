import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { createCanvas } from "@napi-rs/canvas";
import { buildYouTubeTarget, detectSite, downloadFailureHint, firstUrl, getYtDlpBinaryCandidates, tiktokDownload } from "../utils/downloader.js";
import { tiktok } from "../commands/media/social.js";
import { isFullMovieRequest } from "../commands/media/movie.js";
import { makeWelcomeCard } from "../services/welcomeCard.js";
import { COMMAND_ALIASES } from "../services/commandAliases.js";

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

test("YouTube direct links are preserved and plain searches get a yt-dlp fallback target", () => {
    const link = "https://www.youtube.com/watch?v=abcdefghijk";
    assert.equal(buildYouTubeTarget(link), link);
    assert.equal(buildYouTubeTarget("Light Jesus", null), "ytsearch1:Light Jesus");
});

test("download failure hints distinguish YouTube sign-in challenges and HTTP 403", () => {
    assert.match(downloadFailureHint({ details: ["Sign in to confirm you're not a bot"] }), /YT_COOKIES/);
    assert.match(downloadFailureHint({ details: ["Request failed with status code 403"] }), /HTTP 403/);
    assert.match(downloadFailureHint({ details: ["network timeout"] }), /timed out/i);
});

test("song, MP3 and naat shortcuts all route to the shared audio downloader", () => {
    assert.equal(COMMAND_ALIASES.song, "play");
    assert.equal(COMMAND_ALIASES.mp3, "play");
    assert.equal(COMMAND_ALIASES.naat, "play");
});

test("yt-dlp prefers an explicitly configured binary and the Railway Python venv", () => {
    const previous = process.env.YT_DLP_PATH;
    process.env.YT_DLP_PATH = "/custom/yt-dlp";
    try {
        const candidates = getYtDlpBinaryCandidates();
        assert.equal(candidates[0], "/custom/yt-dlp");
        assert.match(candidates[1], /\.venv\/bin\/yt-dlp$/);
        assert.match(candidates[2], /bin\/yt-dlp$/);
    } finally {
        if (previous === undefined) delete process.env.YT_DLP_PATH;
        else process.env.YT_DLP_PATH = previous;
    }
});

test("movie command blocks full-movie download requests but accepts trailer/movie-title searches", () => {
    assert.equal(isFullMovieRequest("full movie Dune Part Two"), true);
    assert.equal(isFullMovieRequest("Dune Part Two full movie"), true);
    assert.equal(isFullMovieRequest("Dune Part Two official trailer"), false);
    assert.equal(isFullMovieRequest("Full Metal Jacket"), false);
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

test("Railway Python venv uses the pinned yt-dlp release when the build venv exists", async t => {
    const binary = resolve(".venv/bin/yt-dlp");
    if (!existsSync(binary)) return t.skip("The Nixpacks build creates this venv during deployment.");
    const version = await new Promise((resolvePromise, reject) => {
        const child = spawn(binary, ["--version"]);
        let output = "";
        child.stdout.on("data", chunk => { output += chunk.toString(); });
        child.once("error", reject);
        child.once("close", code => code === 0 ? resolvePromise(output.trim()) : reject(new Error(`venv yt-dlp exited with ${code}`)));
    });
    assert.equal(version, "2026.10.26");
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
