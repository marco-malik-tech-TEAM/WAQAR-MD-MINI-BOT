/**
 * YouTube media extraction is intentionally disabled. Use official YouTube links
 * or a licensed download source. The bot's downloader only supports public
 * Telegram channel-post videos.
 */
export const downloadYT = async () => {
    throw new Error("YouTube audio/video file extraction is disabled. Use the official link or a licensed source.");
};
