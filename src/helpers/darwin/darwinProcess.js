const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const stream = require('stream');
const { promisify } = require('util');
const darwinCache = require('./darwinCache');
const db = require('../db');
const pipeline = promisify(stream.pipeline);

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
            headers: { 'User-Agent': 'darwin' }
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
        // Ensure temp directory exists
        const tempDir = path.join(__dirname, '../../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const response = await fetch(href);
        
        if (!response.ok) {
            console.error(`${href} ${response.statusText}`);
            if (response.status === 404) {
                await darwinCache.addToCache(href);
            }
            return;
        }
        
        const contentLength = parseInt(response.headers.get('Content-Length'), 10);
        if (contentLength && contentLength > 25 * 1024 * 1024) {
            console.log("Skipping download: File size exceeds limit (25MB)");
            await darwinCache.addToCache(href);
            
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
        
        //cache cleanup
        fs.unlinkSync(safeFilename);
        await darwinCache.addToCache(href);
    } catch (error) {
        console.error(`Error processing video ${title}: ${error}`);
    }
}

async function processGuild(client, guildConfig) {
    try {
        console.log(`Running Darwin process for guild: ${guildConfig.guildId}`);
        
        const response = await fetch(guildConfig.feedUrl, {
            headers: { 'User-Agent': 'darwin' }
        });
        
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const videos = [];
        const contentBlock = $(".content-block > div");
        
        for (const node of contentBlock) {
            try {
                const potential = $(node).find("a").get(0);
                const title = potential?.attribs["title"];
                const href = potential?.attribs["href"];
                
                if (!title) continue;
                
                const finalUrl = await getDestination(href);
                if (finalUrl !== href || !finalUrl.startsWith(guildConfig.markerTwo) || finalUrl === "") continue;
                
                const videoLocation = await getVideoLocation(href, guildConfig.markerOne, guildConfig.markerTwo);
                if (!videoLocation.startsWith(guildConfig.markerTwo) || videoLocation === "") continue;
                
                const isInCache = await darwinCache.isInCache(videoLocation);
                if (isInCache) continue;
                
                console.log(`Discovered "${title.trim()}" at "${videoLocation}"`);
                videos.push({ title, href: videoLocation, comments: href });
            } catch (error) {
                console.error(`Error processing item: ${error}`);
            }
        }
        
        console.log(`Discovered ${videos.length} videos`);
        for (const video of videos) {
            await processVideo(video, client, guildConfig.channelId);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } catch (error) {
        console.error(`Error in Darwin process: ${error}`);
    }
}

async function runDarwinProcess(client) {
    try {
        const configs = await db.query(
            "SELECT * FROM configDarwin WHERE isEnabled = TRUE"
        );
        
        if (configs.length === 0) {
            console.log("No enabled Darwin configurations found");
            return;
        }
        
        console.log(`Processing ${configs.length} Darwin configurations`);
        
        for (const config of configs) {
            await processGuild(client, config);
        }
    } catch (error) {
        console.error(`Error running Darwin process: ${error}`);
    }
}

module.exports = {
    runDarwinProcess
};