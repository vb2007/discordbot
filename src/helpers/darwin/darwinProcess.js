import { load } from "cheerio";
import https from "https";
import { query } from "../db.js";
import { isInCache, addToCache } from "./darwinCache.js";
import config from "../../../config.json" with { type: "json" };

const darwinConfig = config.darwin;

/**
 * Simple HTTPS GET request
 * @param {string} url - URL to fetch
 * @param {Object} headers - Request headers
 * @returns {Promise<string>} - Response body
 */
const httpsGet = (url, headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        "User-Agent": "darwin",
        ...headers,
      },
    };

    https
      .get(url, options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
};

/**
 * Get final URL after redirects
 * @param {string} url - Initial URL
 * @returns {Promise<string>} - Final URL
 */
const getDestination = async (url) => {
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow" });
    return response.url;
  } catch (error) {
    console.error(`Failed to resolve URL: ${error}`);
    return url;
  }
};

/**
 * Extract video location from page
 * @param {string} href - Page URL
 * @param {string} markerOne - First marker
 * @param {string} markerTwo - Second marker
 * @returns {Promise<string>} - Direct video URL
 */
const getVideoLocation = async (href, markerOne, markerTwo) => {
  try {
    const html = await httpsGet(href);
    const start = html.indexOf(markerOne);
    if (start === -1) return "";

    const end = html.slice(start).indexOf(".mp4");
    if (end === -1) return "";

    return html.slice(start, start + end + 4);
  } catch (error) {
    console.error(`Failed to get video location: ${error}`);
    return "";
  }
};

/**
 * Generate Discord message
 * @param {string} title - Video title
 * @param {string} href - Video URL
 * @param {string} comments - Forum post URL
 * @returns {string} - Formatted message
 */
const messageGen = (title, href, comments) => {
  return `[[ STREAMING & DOWNLOAD ]](${href})  -  [[ FORUM POST ]](<${comments}>)\n${title}`;
};

/**
 * Fetch videos from feed
 * @returns {Promise<Array>} - Array of video objects
 */
const fetchVideosFromFeed = async () => {
  try {
    const html = await httpsGet(darwinConfig.feedUrl);
    const $ = load(html);
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

        const isVideoInCache = await isInCache(videoLocation);
        if (isVideoInCache) {
          console.log(`Skipping cached video: ${title.trim()}`);
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
};

/**
 * Distribute video to all configured channels
 * @param {Object} client - Discord client
 * @param {Array} guildConfigs - Guild configurations
 * @param {Object} video - Video object
 */
const distributeVideo = async (client, guildConfigs, video) => {
  const { title, href, comments } = video;
  const message = messageGen(title, href, comments);

  for (const config of guildConfigs) {
    try {
      console.log(`Sending video to guild ${config.guildId}, channel ${config.channelId}`);
      const channel = await client.channels.fetch(config.channelId);

      if (channel) {
        await channel.send(message);
        console.log(`Successfully sent to ${config.channelName} (${config.channelId})`);
      } else {
        console.error(`Failed to fetch channel ${config.channelId}`);
      }
    } catch (error) {
      console.error(`Error sending to channel ${config.channelId}: ${error}`);
    }
  }
};

/**
 * Run the Darwin process
 * @param {Object} client - Discord client
 */
export const runDarwinProcess = async (client) => {
  try {
    const guildConfigs = await query("SELECT * FROM configDarwin");

    if (guildConfigs.length === 0) {
      console.log("No Darwin configurations found");
      return;
    }

    console.log(`Found ${guildConfigs.length} Darwin configurations`);

    const videosToProcess = await fetchVideosFromFeed();
    console.log(`Discovered ${videosToProcess.length} new videos to process`);

    if (videosToProcess.length === 0) {
      console.log("No new videos to process");
      return;
    }

    for (const video of videosToProcess) {
      const addedToCache = await addToCache(video.href);
      if (!addedToCache) {
        console.log(`Failed to add to cache, skipping: ${video.href}`);
        continue;
      }

      await distributeVideo(client, guildConfigs, video);
    }

    console.log("Darwin process completed successfully");
  } catch (error) {
    console.error(`Error running Darwin process: ${error}`);
  }
};
