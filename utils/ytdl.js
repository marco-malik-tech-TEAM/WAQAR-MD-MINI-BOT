import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { randomBytes } from 'crypto';

const MAX_MEDIA_BYTES = 95 * 1024 * 1024;

/**
 * Downloads YouTube media using the local bin/yt-dlp binary.
 * @param {string} url - YouTube URL
 * @param {string} type - 'audio' or 'video'
 * @returns {Promise<Buffer>} - Media buffer
 */
export const downloadYT = async (url, type = 'audio') => {
    return new Promise((resolve, reject) => {
        const tempFile = path.join(os.tmpdir(), `ytdl_${randomBytes(6).toString('hex')}.${type === 'audio' ? 'mp3' : 'mp4'}`);

        const args = type === 'audio'
            ? ['-f', 'bestaudio', '--extract-audio', '--audio-format', 'mp3', '-o', tempFile, url]
            : ['-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best', '-o', tempFile, url];

        const ytDlpPath = path.resolve('./bin/yt-dlp');
        let child;
        try { child = spawn(ytDlpPath, args); }
        catch (error) { return reject(new Error(`Unable to start yt-dlp: ${error.message}`)); }
        let settled = false;
        let timer;
        let errorData = '';
        const cleanup = () => { try { if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile); } catch { } };

        child.stdout?.resume();
        child.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        child.once('error', (error) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            cleanup();
            reject(new Error(`Unable to start yt-dlp: ${error.message}`));
        });

        child.on('close', async (code) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            if (code === 0) {
                try {
                    const size = fs.statSync(tempFile).size;
                    if (size > MAX_MEDIA_BYTES) throw new Error('Downloaded media exceeds WhatsApp\'s 95 MB limit.');
                    const buffer = fs.readFileSync(tempFile);
                    cleanup();
                    resolve(buffer);
                } catch (readErr) {
                    cleanup();
                    reject(new Error(`Failed to read downloaded file: ${readErr.message}`));
                }
            } else {
                cleanup();
                reject(new Error(`yt-dlp failed with code ${code}: ${errorData}`));
            }
        });

        timer = setTimeout(() => {
            if (settled) return;
            settled = true;
            child.kill('SIGTERM');
            cleanup();
            reject(new Error('yt-dlp download timed out after five minutes.'));
        }, 5 * 60 * 1000);
    });
};
