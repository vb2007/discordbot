const cheerio = require('cheerio');
const cache = require('./cache.js');
const settings = require('./settings');
const { destination } = require('./destination.js');
const discord = require('./discord.js');
const fs = require('fs');
const stream = require('stream');
const { promisify } = require('util');
const pipeline = promisify(stream.pipeline);
const sleep = ms => new Promise(end => setTimeout(end, ms));

const fetch_config = {
    headers: {
        'User-Agent': 'darwin', 
    },
};

main();

async function main() {
    for(;;) {
        await Promise.all([loop(), sleep(settings.interval)]);
    }
}

async function getVideoLocation(href) {
    const response = await fetch(href, fetch_config);
    const html = await response.text();
    const start = html.indexOf(settings.marker_one);
    const end = html.slice(start).indexOf('.mp4');
    return html.slice(start, start + end + 4);
}

async function loop() {
    try {
        const response = await fetch(settings.feed, fetch_config);
        const html = await response.text();
        const $ = cheerio.load(html);

        const videos = [];
        const content_block = $(".content-block > div");

        for(const node of content_block) {
            try {
                const potential = $(node).find("a").get(0);
                const title = potential?.attribs["title"];
                const href = potential?.attribs["href"];
                if(title === undefined) continue;
                const final = await destination(href);
                if(final !== href || !final.startsWith(settings.marker_two) || final == "") continue;
                const video_location = await getVideoLocation(href);
                if(!video_location.startsWith(settings.marker_two) || video_location == "") continue;
                if(cache.have(video_location)) continue;
                console.log(`discovered "${title.trim()}" at "${video_location}"`);
                videos.push({title, "href":video_location, "comments":href});
            } catch (error) {
                console.error(`${title} ${error.msg}`);
            }

        }

        console.log(`discovered ${videos.length} videos`);
        for(const video of videos) await process(video);

    } catch (error) {
        console.error(error);
    }
}

function messageGen(title, href, comments) {
    return `[[ - MP4 - ]](<${href}>)  -  [[ - SOURCE - ]](<${comments}>)  -  ${title}`
}

function sanitizeFilename(title) {
        const maxLength = 50;

        // Replace spaces with periods
        let safeTitle = title.replace(/ /g, '.');

        // Whitelist alphanumeric characters, hyphens, and periods
        safeTitle = safeTitle.replace(/[^a-zA-Z0-9-.]/g, '');

        // Limit length and handle double periods
        safeTitle = safeTitle.substring(0, maxLength);
        while (safeTitle.includes('..')) safeTitle = safeTitle.replace('..', '.');

        if(safeTitle.endsWith('.')) safeTitle = safeTitle.slice(0, -1);

        // Encode for URI safety (optional, but recommended for filenames)
        safeTitle = encodeURIComponent(safeTitle);

        return safeTitle;
}
async function process({title, href, comments}) {
    console.log(`processing ${title} ${href}`);
    const response = await fetch(href);

    if (!response.ok) {
      console.error(`${href} ${response.statusText}`);
      if(response.statusText == "Not Found") cache.add(href); // avoid retrying, video is deleted anyway
      return;
    }

    const contentLength = parseInt(response.headers.get('Content-Length'), 10);
    if (contentLength && contentLength > 25 * 1024 * 1024) {
        console.log("Skipping download: File size exceeds limit (25MB)");
        cache.add(href); // Potentially add URL to cache to avoid retries
        messageGen(title, href, comments) + ` - Too big for upload (${(contentLength/1000000).toFixed(0)} mb)`
        return await discord.text(messageGen(title, href, comments) + ` - Too big for upload (${(contentLength/1000000).toFixed(0)} mb)`);

    }


    const safeFilename = `./temp/${sanitizeFilename(title)}.mp4`;

    console.log("streaming");
    await pipeline(response.body, fs.createWriteStream(safeFilename));
    console.log("uploading");
    try {
        await discord.upload(messageGen(title, href, comments), safeFilename);
    } catch (error) {
        console.error(`Discord upload fail: ${error.msg}`);
        console.error(error.stack);
    }

    fs.rmSync(safeFilename);
    cache.add(href);
    await sleep(1000);
}

/*
0|Darwin  | TypeError: Failed to parse URL from
0|Darwin  |     at node:internal/deps/undici/undici:12345:11
0|Darwin  |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|Darwin  |     at async process (/home/zom/nodes/Darwin/gbot.js:59:22)
0|Darwin  |     at async loop (/home/zom/nodes/Darwin/gbot.js:51:36)
0|Darwin  |     at async Promise.all (index 0)
0|Darwin  |     at async main (/home/zom/nodes/Darwin/gbot.js:16:9) {
0|Darwin  |   [cause]: TypeError: Invalid URL
0|Darwin  |       at new URL (node:internal/url:796:36)
0|Darwin  |       at new Request (node:internal/deps/undici/undici:5853:25)
0|Darwin  |       at fetch (node:internal/deps/undici/undici:10123:25)
0|Darwin  |       at fetch (node:internal/deps/undici/undici:12344:10)
0|Darwin  |       at fetch (node:internal/bootstrap/web/exposed-window-or-worker:79:16)
0|Darwin  |       at process (/home/zom/nodes/Darwin/gbot.js:59:28)
0|Darwin  |       at loop (/home/zom/nodes/Darwin/gbot.js:51:42)
0|Darwin  |       at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
0|Darwin  |       at async Promise.all (index 0)
0|Darwin  |       at async main (/home/zom/nodes/Darwin/gbot.js:16:9) {
0|Darwin  |     code: 'ERR_INVALID_URL',
0|Darwin  |     input: ''
0|Darwin  |   }
0|Darwin  | }
*/
