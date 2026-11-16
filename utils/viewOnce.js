const VIEW_ONCE_WRAPPERS = ["viewOnceMessage", "viewOnceMessageV2", "viewOnceMessageV2Extension"];
const TRANSPARENT_WRAPPERS = ["ephemeralMessage", "documentWithCaptionMessage"];
const MEDIA_KEYS = ["imageMessage", "videoMessage", "audioMessage"];

export function unwrapViewOnceMessage(message) {
    let content = message || {};
    let isViewOnce = false;

    for (let depth = 0; depth < 12; depth++) {
        let inner = null;
        for (const key of VIEW_ONCE_WRAPPERS) {
            if (content?.[key]?.message) {
                inner = content[key].message;
                isViewOnce = true;
                break;
            }
        }
        if (!inner) {
            for (const key of TRANSPARENT_WRAPPERS) {
                if (content?.[key]?.message) {
                    inner = content[key].message;
                    break;
                }
            }
        }
        if (!inner) break;
        content = inner;
    }

    let mediaType = null;
    let media = null;
    for (const key of MEDIA_KEYS) {
        if (content?.[key]) {
            media = content[key];
            mediaType = key === "imageMessage" ? "image" : key === "videoMessage" ? "video" : "audio";
            if (media.viewOnce === true) isViewOnce = true;
            break;
        }
    }
    if (content?.viewOnce === true) isViewOnce = true;
    return { content, isViewOnce, mediaType, media };
}

export function isViewOnceMessage(message) {
    return unwrapViewOnceMessage(message).isViewOnce;
}
