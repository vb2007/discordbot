const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');
const darwinCache = require('./darwinCache');
const db = require('../db');
const config = require('../../../config.json');
const { transcodeVideo, getFileSizeMB } = require('./darwinTranscode');

const darwinConfig = config.darwin || {
    feedUrl: "https://theync.com/most-recent/",
    interval: 60000,
    markerOne: "https://theync.com/media/video",
    markerTwo: "https://theync.com"
};

/**
 * Get the final destination of a URL (follow redirects)
 * @param {string} url - Initial URL
 * @returns {Promise<string>} - Final URL after redirects
 */
async function getDestination(url) {
    try {
        const response = await fetch(url, { 
            method: 'HEAD',
            redirect: 'follow'
        });
        return response.url;
    } catch (error) {
        console.error(`Failed to resolve URL destination: ${error}`);
        return url;
    }
}

/**
 * Extract video location from a page
 * @param {string} href - Page URL
 * @param {string} markerOne - First marker to identify video
 * @param {string} markerTwo - Second marker to identify video
 * @returns {Promise<string>} - Direct video URL
 */
async function getVideoLocation(href, markerOne, markerTwo) {
    try {
        const response = await fetch(href, {
            //if it isn't set to "darwin" the scraping fails for some reason
            headers: { "User-Agent": "darwin" }
            // headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0" }
        });
        const html = await response.text();
        const start = html.indexOf(markerOne);
        if (start === -1) return '';
        
        const end = html.slice(start).indexOf('.mp4');
        if (end === -1) return '';
        
        return html.slice(start, start + end + 4);
    } catch (error) {
        console.error(`Failed to get video location: ${error}`);
        return '';
    }
}

/**
 * Generate message for Discord channel
 * @param {string} title - Video title
 * @param {string} href - Source URL
 * @param {string} directStreamLink - Direct streaming link
 * @param {string} comments - Comments/forum URL
 * @param {boolean} canBeStreamed - Whether video can be streamed
 * @param {number} fileSize - File size in MB
 * @returns {string} - Formatted message
 */
function messageGen(title, href, directStreamLink, comments, canBeStreamed, fileSize) {
    return `${(canBeStreamed ? `[[ STREAMING & DOWNLOAD ]](${directStreamLink})` : `[[ ORIGINAL SOURCE'S MP4 ]](${href})`)}  -  [[ VIDEO'S FORUM POST ]](<${comments}>)  -  ${title}${canBeStreamed ? "" : ` - Might be too big for direct streaming on Discord (${fileSize}MB)`}`;
}

/**
 * Process a single video
 * @param {Object} video - Video metadata
 * @param {Object} client - Discord client
 * @param {string} channelId - Target Discord channel ID
 * @returns {Promise<boolean>} - Whether processing was successful
 */
async function processVideo(video, client, channelId) {
    const { title, href, comments } = video;
    console.log(`Processing ${title} ${href}`);
    
    try {
        const isInCache = await darwinCache.isInCache(href);
        if (isInCache) {
            console.log(`Video already in cache, skipping: ${href}`);
            return true;
        }
        
        // Add to cache BEFORE downloading to prevent multiple uploads
        const addedToCache = await darwinCache.addToCache(href);
        if (!addedToCache) {
            console.log(`Failed to add to cache, skipping to prevent duplicates: ${href}`);
            return false;
        }
        
        const targetDir = "/mnt/raid1/cdn/darwinTest";
        const tempDir = "/mnt/raid1/cdn/darwinTest/transcodes";
        
        const response = await fetch(href);
        
        if (!response.ok) {
            console.error(`${href} ${response.statusText}`);
            return false;
        }
        
        const contentLength = parseInt(response.headers.get('Content-Length'), 10);
        if (contentLength && contentLength > 50 * 1024 * 1024) {
            console.log("Skipping download: File size exceeds limit (50MB)");

            const fileSize = (contentLength / 1000000).toFixed(0);
            const message = messageGen(title, href, "", comments, false, fileSize);

            const channel = await client.channels.fetch(channelId);
            if (channel) await channel.send(message);
            return true;
        }

        const videoId = href.split('/').pop().replace('.mp4', '');
        const tempFilePath = path.join(tempDir, `${videoId}_original.mp4`);
        const transcodedFilePath = path.join(tempDir, `${videoId}_transcoded.mp4`);
        const finalFilePath = path.join(targetDir, `${videoId}.mp4`);
        const directStreamLink = `https://cdn.vb2007.hu/darwin/${videoId}.mp4`;

        console.log(`Downloading video to temp location: ${tempFilePath}`);
        await pipeline(response.body, fs.createWriteStream(tempFilePath));
        
        if (!fs.existsSync(tempFilePath)) {
            console.error(`Error when saving temporary file: ${tempFilePath}`);
            return false;
        }

        const originalSize = getFileSizeMB(tempFilePath);
        console.log(`Original file size: ${originalSize}MB`);

        try {
            console.log('Starting video transcoding process...');
            const transcodingSuccess = await transcodeVideo(tempFilePath, transcodedFilePath);
            
            if (transcodingSuccess) {
                const transcodedSize = getFileSizeMB(transcodedFilePath);
                console.log(`Transcoded file size: ${transcodedSize}MB (${Math.round((transcodedSize/originalSize)*100)}% of original)`);
                
                fs.copyFileSync(transcodedFilePath, finalFilePath);
                console.log(`File moved to final destination: ${finalFilePath}`);
            } else {
                throw new Error("Transcoding failed to produce valid output");
            }
            
            // Clean up temp files
            // if (fs.existsSync(tempFilePath)) {
            //     fs.unlinkSync(tempFilePath);
            // }
            // if (fs.existsSync(transcodedFilePath)) {
            //     fs.unlinkSync(transcodedFilePath);
            // }
            console.log('Temporary files cleaned up');
            
            console.log("Sending video to channel with direct CDN stream link");
            const channel = await client.channels.fetch(channelId);
            
            const message = messageGen(title, href, directStreamLink, comments, true, 0);
            if (channel) await channel.send(message);
            
            console.log(`Transcoded video saved to CDN: ${directStreamLink}`);
            return true;
        }
        catch (error) {
            console.error(`Transcoding failed, attempting to use original file: ${error}`);
            
            try {
                // Use original file as fallback
                fs.copyFileSync(tempFilePath, finalFilePath);
                console.log(`Original file moved to final destination: ${finalFilePath}`);
                
                // Clean up temporary files
                if (fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                    console.log('Original temporary file cleaned up');
                }
                
                if (fs.existsSync(transcodedFilePath)) {
                    fs.unlinkSync(transcodedFilePath);
                    console.log('Partial transcoded file cleaned up');
                }
                
                // Check if the file is small enough for Discord streaming
                const finalSize = getFileSizeMB(finalFilePath);
                const canStream = finalSize < 50; // Discord's approximate limit
                
                const channel = await client.channels.fetch(channelId);
                const message = messageGen(title, href, directStreamLink, comments, canStream, finalSize);
                if (channel) await channel.send(message);
                
                return true;
            } catch (fallbackError) {
                console.error(`Failed to use original file as fallback: ${fallbackError}`);
                return false;
            }
        }
    }
    catch (error) {
        console.error(`Error processing video ${title}: ${error}`);
        return false;
    }
}

/**
 * Process videos for a guild
 * @param {Object} client - Discord client
 * @param {Object} guildConfig - Guild configuration
 * @returns {Promise<void>}
 */
async function processGuild(client, guildConfig) {
    try {
        console.log(`Running Darwin process for guild: ${guildConfig.guildId}`);
        
        const response = await fetch(darwinConfig.feedUrl, {
            //if it isn't set to "darwin" the scraping fails for some reason
            headers: { "User-Agent": "darwin" }
        });
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const contentBlock = $(".content-block > div");
        
        const videosToProcess = [];
        
        for (const node of contentBlock) {
            try {
                const potential = $(node).find("a").get(0);
                const title = potential?.attribs["title"];
                const href = potential?.attribs["href"];
                
                if (!title) continue;
                
                const finalUrl = await getDestination(href);
                if (finalUrl !== href || !finalUrl.startsWith(darwinConfig.markerTwo) || finalUrl === "") continue;
                
                const videoLocation = await getVideoLocation(href, darwinConfig.markerOne, darwinConfig.markerTwo);
                if (!videoLocation.startsWith(darwinConfig.markerTwo) || videoLocation === "") continue;
                
                const isInCache = await darwinCache.isInCache(videoLocation);
                if (isInCache) {
                    console.log(`Skipping cached video: ${title.trim()} (${videoLocation})`);
                    continue;
                }
                
                console.log(`Discovered "${title.trim()}" at "${videoLocation}"`);
                videosToProcess.push({ title, href: videoLocation, comments: href });
            }
            catch (error) {
                console.error(`Error processing item: ${error}`);
            }
        }
        
        console.log(`Discovered ${videosToProcess.length} new videos to process`);
        
        const concurrencyLimit = 2; // Process max 2 videos at a time
        let activeTasks = 0;
        let videoIndex = 0;

        async function processNextVideos() {
            while (activeTasks < concurrencyLimit && videoIndex < videosToProcess.length) {
                const video = videosToProcess[videoIndex++];
                activeTasks++;
                
                processVideo(video, client, guildConfig.channelId)
                    .finally(() => {
                        activeTasks--;
                        if (videoIndex < videosToProcess.length) {
                            processNextVideos();
                        }
                    });
                
                if (videoIndex < videosToProcess.length) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        }
        
        await processNextVideos();
        
        while (activeTasks > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    catch (error) {
        console.error(`Error in Darwin process: ${error}`);
    }
}

/**
 * Run the Darwin process for all configured guilds
 * @param {Object} client - Discord client
 * @returns {Promise<void>}
 */
async function runDarwinProcess(client) {
    try {
        const configs = await db.query(
            "SELECT * FROM configDarwin"
        );
        
        if (configs.length === 0) {
            console.log("No Darwin configurations found");
            return;
        }
        
        console.log(`Processing ${configs.length} Darwin configurations`);
        
        for (const config of configs) {
            await processGuild(client, config);
        }
    }
    catch (error) {
        console.error(`Error running Darwin process: ${error}`);
    }
}

module.exports = {
    runDarwinProcess
};