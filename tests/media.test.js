import test from "node:test";
import assert from "node:assert/strict";
import { createCanvas } from "@napi-rs/canvas";
import { detectSite, downloadMedia, isPublicTelegramPost, ytdlp } from "../utils/downloader.js";
import { makeWelcomeCard } from "../services/welcomeCard.js";

test("only public Telegram channel post URLs are accepted for the Telegram extractor", () => {
    assert.equal(isPublicTelegramPost("https://t.me/europa_press/613"), true);
    assert.equal(isPublicTelegramPost("https://www.t.me/channel_name/42?single"), true);
    assert.equal(isPublicTelegramPost("http://t.me/channel_name/42"), false);
    assert.equal(isPublicTelegramPost("https://t.me/s/channel_name/42"), false);
    assert.equal(isPublicTelegramPost("https://t.me.attacker.example/channel_name/42"), false);
    assert.equal(isPublicTelegramPost("https://t.me/+privateInviteCode"), false);
});

test("detectSite distinguishes supported public Telegram posts and YouTube links", () => {
    assert.equal(detectSite("https://t.me/europa_press/613"), "telegram");
    assert.equal(detectSite("https://youtube.com/watch?v=he7tX1N46n8"), "youtube");
    assert.equal(detectSite("https://t.me/+privateInviteCode"), "generic");
});

test("YouTube audio/video extraction is blocked in the downloader", async () => {
    await assert.rejects(
        downloadMedia("https://youtube.com/watch?v=he7tX1N46n8", { site: "youtube", kind: "video" }),
        /official YouTube link or a licensed source/i
    );
    await assert.rejects(ytdlp("https://youtube.com/watch?v=he7tX1N46n8", "audio"), /publicly accessible Telegram/i);
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
