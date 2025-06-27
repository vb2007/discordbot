const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');
const darwinCache = require('./darwinCache');
const db = require('../db');
const config = require('../../../config.json');

const darwinConfig = config.darwin || {
    feedUrl: "https://theync.com/most-recent/",
    interval: 60000,
    markerOne: "https://theync.com/media/video",
    markerTwo: "https://theync.com"
};

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

function sanitizeFilename(title) {
    const maxLength = 50;
    let safeTitle = title.replace(/ /g, '.');
    safeTitle = safeTitle.replace(/[^a-zA-Z0-9-.]/g, '');
    safeTitle = safeTitle.substring(0, maxLength);
    
    while (safeTitle.includes('..')) {
        safeTitle = safeTitle.replace('..', '.');
    }
    
    if (safeTitle.endsWith('.')) {
        safeTitle = safeTitle.slice(0, -1);
    }
    
    return encodeURIComponent(safeTitle);
}

function messageGen(title, href, comments) {
    return `[[ - MP4 - ]](<${href}>)  -  [[ - SOURCE - ]](<${comments}>)  -  ${title}`;
}

async function processVideo(video, client, channelId) {
    const { title, href, comments } = video;
    console.log(`Processing ${title} ${href}`);
    
    try {
        //double check cache right before processing
        const isInCache = await darwinCache.isInCache(href);
        if (isInCache) {
            console.log(`Video already in cache, skipping: ${href}`);
            return;
        }
        
        //add to cache BEFORE downloading to prevent multiple uploads / sending of the same videos
        const addedToCache = await darwinCache.addToCache(href);
        if (!addedToCache) {
            console.log(`Failed to add to cache, skipping to prevent duplicates: ${href}`);
            return;
        }
        
        const tempDir = path.join(__dirname, '../../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const response = await fetch(href);
        
        if (!response.ok) {
            console.error(`${href} ${response.statusText}`);
            return;
        }
        
        const contentLength = parseInt(response.headers.get('Content-Length'), 10);
        if (contentLength && contentLength > 10 * 1024 * 1024) {
            console.log("Skipping download: File size exceeds limit (10MB)");
            
            const message = messageGen(title, href, comments) + 
                ` - Too big for upload (${(contentLength / 1000000).toFixed(0)} mb)`;
            
            const channel = await client.channels.fetch(channelId);
            if (channel) await channel.send(message);
            return;
        }
        
        const safeFilename = path.join(tempDir, `${sanitizeFilename(title)}.mp4`);
        
        console.log("Streaming video to disk");
        await pipeline(response.body, fs.createWriteStream(safeFilename));
        
        console.log("Uploading to Discord");
        const channel = await client.channels.fetch(channelId);
        if (channel) {
            await channel.send({
                content: messageGen(title, href, comments),
                files: [safeFilename]
            });
        }
        
        fs.unlinkSync(safeFilename);
    }
    catch (error) {
        console.error(`Error processing video ${title}: ${error}`);
    }
}

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
        
        for (const video of videosToProcess) {
            await processVideo(video, client, guildConfig.channelId);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    catch (error) {
        console.error(`Error in Darwin process: ${error}`);
    }
}

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