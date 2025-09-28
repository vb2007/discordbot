const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream/promises");
const darwinCache = require("./darwinCache");
const db = require("../db");
const config = require("../../../config.json");
const darwinConfig = config.darwin;
const { transcodeVideo, getFileSizeMB } = require("./darwinTranscode");

/**
 * Get the final destination of a URL (follow redirects)
 * @param {string} url - Initial URL
 * @returns {Promise<string>} - Final URL after redirects
 */
async function getDestination(url) {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
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
      headers: { "User-Agent": "darwin" },
      // headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0" }
    });
    const html = await response.text();
    const start = html.indexOf(markerOne);
    if (start === -1) return "";

    const end = html.slice(start).indexOf(".mp4");
    if (end === -1) return "";

    return html.slice(start, start + end + 4);
  } catch (error) {
    console.error(`Failed to get video location: ${error}`);
    return "";
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
  return `${canBeStreamed ? `[[ STREAMING & DOWNLOAD ]](${directStreamLink})` : `[[ ORIGINAL MP4 ]](${href})`}  -  [[ FORUM POST ]](<${comments}>)\n${title}${canBeStreamed ? `\nSize: ${fileSize}MB` : `\nSize (might won't load): ${fileSize}MB`}`;
}

/**
 * Process a single video
 * @param {Object} video - Video metadata
 * @returns {Promise<Object|null>} - Processed video result or null if failed
 */
async function processVideo(video) {
  const { title, href, comments } = video;
  console.log(`Processing ${title} ${href}`);

  try {
    const isInCache = await darwinCache.isInCache(href);
    if (isInCache) {
      console.log(`Video already in cache, skipping: ${href}`);
      return null;
    }

    // Add to cache BEFORE downloading to prevent multiple uploads
    const addedToCache = await darwinCache.addToCache(href);
    if (!addedToCache) {
      console.log(`Failed to add to cache, skipping to prevent duplicates: ${href}`);
      return null;
    }

    const response = await fetch(href);

    if (!response.ok) {
      console.error(`${href} ${response.statusText}`);
      return null;
    }

    const contentLength = parseInt(response.headers.get("Content-Length"), 10);
    if (contentLength && contentLength > 50 * 1024 * 1024) {
      console.log("Skipping download: File size exceeds limit (50MB)");

      const fileSize = (contentLength / 1000000).toFixed(0);
      // Return info for too large videos
      return {
        title,
        href,
        comments,
        canBeStreamed: false,
        directStreamLink: "",
        fileSize,
        tooBig: true,
      };
    }

    const videoId = href.split("/").pop().replace(".mp4", "");
    const tempFilePath = path.join(darwinConfig.tempDir, `${videoId}_original.mp4`);
    const transcodedFilePath = path.join(darwinConfig.tempDir, `${videoId}_transcoded.mp4`);
    const finalFilePath = path.join(darwinConfig.targetDir, `${videoId}.mp4`);
    const directStreamLink = `${darwinConfig.cdnUrl}/${videoId}.mp4`;

    console.log(`Downloading video to temp location: ${tempFilePath}`);
    await pipeline(response.body, fs.createWriteStream(tempFilePath));

    if (!fs.existsSync(tempFilePath)) {
      console.error(`Error when saving temporary file: ${tempFilePath}`);
      return null;
    }

    const originalSize = getFileSizeMB(tempFilePath);
    console.log(`Original file size: ${originalSize}MB`);

    try {
      console.log("Starting video transcoding process...");
      const transcodingSuccess = await transcodeVideo(tempFilePath, transcodedFilePath);

      const transcodedSize = getFileSizeMB(transcodedFilePath);
      if (transcodingSuccess) {
        console.log(
          `Transcoded file size: ${transcodedSize}MB (${Math.round((transcodedSize / originalSize) * 100)}% of original)`
        );

        fs.copyFileSync(transcodedFilePath, finalFilePath);
        console.log(`File moved to final destination: ${finalFilePath}`);
      } else {
        throw new Error("Transcoding failed to produce valid output");
      }

      // Clean up temp files
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      if (fs.existsSync(transcodedFilePath)) {
        fs.unlinkSync(transcodedFilePath);
      }
      console.log("Temporary files cleaned up");

      // Return success result
      return {
        title,
        href,
        comments,
        directStreamLink,
        canBeStreamed: true,
        fileSize: transcodedSize,
      };
    } catch (error) {
      console.error(`Transcoding failed, attempting to use original file: ${error}`);

      try {
        // Use original file as fallback
        fs.copyFileSync(tempFilePath, finalFilePath);
        console.log(`Original file moved to final destination: ${finalFilePath}`);

        // Clean up temporary files
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
          console.log("Original temporary file cleaned up");
        }

        if (fs.existsSync(transcodedFilePath)) {
          fs.unlinkSync(transcodedFilePath);
          console.log("Partial transcoded file cleaned up");
        }

        const finalSize = getFileSizeMB(finalFilePath);
        const canStream = finalSize < 50; // I will run out of storage & network bandwidth quick if that's higher

        return {
          title,
          href,
          comments,
          directStreamLink,
          canBeStreamed: canStream,
          fileSize: finalSize,
        };
      } catch (fallbackError) {
        console.error(`Failed to use original file as fallback: ${fallbackError}`);
        return null;
      }
    }
  } catch (error) {
    console.error(`Error processing video ${title}: ${error}`);
    return null;
  }
}

/**
 * Distribute a processed video to all configured channels
 * @param {Object} client - Discord client
 * @param {Array} guildConfigs - Array of guild configurations
 * @param {Object} processedVideo - Processed video result
 * @returns {Promise<void>}
 */
async function distributeVideo(client, guildConfigs, processedVideo) {
  const { title, href, comments, directStreamLink, canBeStreamed, fileSize } = processedVideo;

  const message = messageGen(title, href, directStreamLink, comments, canBeStreamed, fileSize);

  for (const config of guildConfigs) {
    try {
      console.log(`Sending video to guild ${config.guildId}, channel ${config.channelId}`);
      const channel = await client.channels.fetch(config.channelId);

      if (channel) {
        await channel.send(message);
        console.log(
          `Successfully sent video to channel ${config.channelName} (${config.channelId})`
        );
      } else {
        console.error(`Failed to fetch channel ${config.channelId}`);
      }
    } catch (error) {
      console.error(`Error sending to channel ${config.channelId}: ${error}`);
    }
  }
}

/**
 * Fetch videos from feed
 * @returns {Promise<Array>} - Array of video objects
 */
async function fetchVideosFromFeed() {
  try {
    const response = await fetch(darwinConfig.feedUrl, {
      headers: { "User-Agent": "darwin" },
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
        if (finalUrl !== href || !finalUrl.startsWith(darwinConfig.markerTwo) || finalUrl === "")
          continue;

        const videoLocation = await getVideoLocation(
          href,
          darwinConfig.markerOne,
          darwinConfig.markerTwo
        );
        if (!videoLocation.startsWith(darwinConfig.markerTwo) || videoLocation === "") continue;

        const isInCache = await darwinCache.isInCache(videoLocation);
        if (isInCache) {
          console.log(`Skipping cached video: ${title.trim()} (${videoLocation})`);
          continue;
        }

        console.log(`Discovered "${title.trim()}" at "${videoLocation}"`);
        videosToProcess.push({ title, href: videoLocation, comments: href });
      } catch (error) {
        console.error(`Error processing item: ${error}`);
      }
    }

    return videosToProcess;
  } catch (error) {
    console.error(`Error fetching videos from feed: ${error}`);
    return [];
  }
}

/**
 * Run the Darwin process for all configured guilds
 * @param {Object} client - Discord client
 * @returns {Promise<void>}
 */
async function runDarwinProcess(client) {
  try {
    // Get all guild configurations
    const guildConfigs = await db.query("SELECT * FROM configDarwin");

    if (guildConfigs.length === 0) {
      console.log("No Darwin configurations found");
      return;
    }

    console.log(`Found ${guildConfigs.length} Darwin configurations`);

    // Fetch videos from feed once
    const videosToProcess = await fetchVideosFromFeed();
    console.log(`Discovered ${videosToProcess.length} new videos to process`);

    if (videosToProcess.length === 0) {
      console.log("No new videos to process");
      return;
    }

    // Process videos one at a time, with concurrency limit
    const concurrencyLimit = 2;
    let activeTasks = 0;
    let videoIndex = 0;
    const processedVideos = [];

    async function processNextVideos() {
      while (activeTasks < concurrencyLimit && videoIndex < videosToProcess.length) {
        const video = videosToProcess[videoIndex++];
        activeTasks++;

        try {
          const result = await processVideo(video);
          if (result) {
            processedVideos.push(result);

            // If it's a "too big" video, distribute immediately
            if (result.tooBig) {
              await distributeVideo(client, guildConfigs, result);
            }
          }
        } finally {
          activeTasks--;
          if (videoIndex < videosToProcess.length) {
            processNextVideos();
          }
        }

        if (videoIndex < videosToProcess.length) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    }

    await processNextVideos();

    // Wait for all processing to complete
    while (activeTasks > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Filter out "too big" videos that were already distributed
    const videosToDistribute = processedVideos.filter((video) => !video.tooBig);
    console.log(
      `Successfully processed ${videosToDistribute.length} videos, distributing to ${guildConfigs.length} channels`
    );

    // Distribute each processed video to all configured channels
    for (const video of videosToDistribute) {
      await distributeVideo(client, guildConfigs, video);
    }

    console.log("Darwin process completed successfully");
  } catch (error) {
    console.error(`Error running Darwin process: ${error}`);
  }
}

module.exports = {
  runDarwinProcess,
};
