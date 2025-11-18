import { load } from "cheerio";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

import { query } from "../db.js";
import { transcodeVideo, getFileSizeMB } from "./darwinTranscode.js";
import { isInCache, addToCache } from "./darwinCache.js";
import {
  downloadWithRetry,
  getFileSizeWithRandomizedCurl,
  establishSession,
  testCurl,
  getCurlInfo,
} from "./darwinAntiFingerprint.js";

import config from "../../../config.json" with { type: "json" };
const darwinConfig = config.darwin;

/**
 * Note: Download functions have been moved to darwinAntiFingerprint.js
 * This module now provides advanced TLS fingerprint randomization
 * to evade Cloudflare's bot detection systems.
 */

/**
 * Get the final destination of a URL (follow redirects)
 * @param {string} url - Initial URL
 * @returns {Promise<string>} - Final URL after redirects
 */
const getDestination = async (url) => {
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
};

/**
 * Extract video location from a page
 * @param {string} href - Page URL
 * @param {string} markerOne - First marker to identify video
 * @param {string} markerTwo - Second marker to identify video
 * @returns {Promise<string>} - Direct video URL
 */
const getVideoLocation = async (href, markerOne, markerTwo) => {
  try {
    const response = await fetch(href, {
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
};

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
const messageGen = (title, href, comments, canBeStreamed, fileSize, directStreamLink = "") => {
  return `${canBeStreamed ? `[[ STREAMING & DOWNLOAD ]](${directStreamLink})` : `[[ ORIGINAL MP4 ]](${href})`}  -  [[ FORUM POST ]](<${comments}>)\n${title}${canBeStreamed ? `\nSize: ${fileSize}MB` : `\nSize (might won't load): ${fileSize}MB`}`;
};

/**
 * Process a single video
 * @param {Object} video - Video metadata
 * @returns {Promise<Object|null>} - Processed video result or null if failed
 */
const processVideo = async (video) => {
  const { title, href, comments } = video;
  console.log(`Processing ${title} ${href}`);

  try {
    const isVideoInCache = await isInCache(href);
    if (isVideoInCache) {
      console.log(`Video already in cache, skipping: ${href}`);
      return null;
    }

    // Add to cache BEFORE downloading to prevent multiple uploads
    const addedToCache = await addToCache(href);
    if (!addedToCache) {
      console.log(`Failed to add to cache, skipping to prevent duplicates: ${href}`);
      return null;
    }

    const videoId = href.split("/").pop().replace(".mp4", "");
    const tempFilePath = path.join(darwinConfig.tempDir, `${videoId}_original.mp4`);
    const transcodedFilePath = path.join(darwinConfig.tempDir, `${videoId}_transcoded.mp4`);
    const finalFilePath = path.join(darwinConfig.targetDir, `${videoId}.mp4`);
    const directStreamLink = `${darwinConfig.cdnUrl}/${videoId}.mp4`;

    // Check file size before downloading
    console.log(`Checking file size for: ${href}`);
    const fileSizeBytes = await getFileSizeWithRandomizedCurl(href, comments);

    if (fileSizeBytes) {
      const fileSizeMB = (fileSizeBytes / 1024 / 1024).toFixed(2);
      console.log(`File size: ${fileSizeMB}MB`);

      if (fileSizeBytes > darwinConfig.maxDownloadSize * 1024 * 1024) {
        console.log(`File exceeds limit (${darwinConfig.maxDownloadSize}MB), using direct link`);
        return {
          title,
          href,
          comments,
          canBeStreamed: false,
          fileSize: fileSizeMB,
        };
      }
    } else {
      console.log("Could not determine file size, will proceed with download");
    }

    console.log(`Downloading video using anti-fingerprint curl: ${href}`);

    // Establish session by visiting the referrer page first (like a real browser)
    try {
      await establishSession(comments);
      // Wait a bit after session establishment before downloading video
      const sessionDelay = 1000 + Math.random() * 2000; // 1-3 seconds
      console.log(`Post-session delay: ${Math.round(sessionDelay)}ms`);
      await new Promise((resolve) => setTimeout(resolve, sessionDelay));
    } catch (sessionError) {
      console.log(`Session establishment failed, continuing anyway: ${sessionError.message}`);
    }

    // Add random delay to avoid appearing automated
    const preDownloadDelay = 500 + Math.random() * 1500; // 0.5-2 seconds
    console.log(`Pre-download delay: ${Math.round(preDownloadDelay)}ms`);
    await new Promise((resolve) => setTimeout(resolve, preDownloadDelay));

    try {
      await downloadWithRetry(href, comments, tempFilePath, 3);
      console.log("Successfully downloaded using randomized fingerprint");
    } catch (downloadError) {
      console.error(`All download attempts failed: ${downloadError.message}`);

      // Test curl again if downloads are failing
      if (downloadError.message.includes("ENOENT") || downloadError.message.includes("spawn")) {
        console.log("🔧 Re-testing curl due to spawn errors...");
        const curlStillWorking = await testCurl();
        if (!curlStillWorking) {
          console.error("❌ Curl is no longer working - stopping Darwin process");
        }
      }

      return null;
    }

    if (!fs.existsSync(tempFilePath)) {
      console.error(`Error when saving temporary file: ${tempFilePath}`);
      return null;
    }

    const originalSize = getFileSizeMB(tempFilePath);
    console.log(`Original file size: ${originalSize}MB`);

    // Double-check size after download (fallback if HEAD request didn't work)
    if (originalSize > darwinConfig.maxDownloadSize) {
      console.log(`File too large (${originalSize}MB), removing and using direct link`);
      fs.unlinkSync(tempFilePath);
      return {
        title,
        href,
        comments,
        canBeStreamed: false,
        fileSize: originalSize.toFixed(2),
      };
    }

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

      return {
        title,
        href,
        comments,
        canBeStreamed: true,
        fileSize: transcodedSize,
        directStreamLink,
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
        const canStream = finalSize <= darwinConfig.maxDownloadSize;

        return {
          title,
          href,
          comments,
          canBeStreamed: canStream,
          fileSize: finalSize,
          directStreamLink,
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
};

/**
 * Distribute a processed video to all configured channels
 * @param {Object} client - Discord client
 * @param {Array} guildConfigs - Array of guild configurations
 * @param {Object} processedVideo - Processed video result
 * @returns {Promise<void>}
 */
const distributeVideo = async (client, guildConfigs, processedVideo) => {
  const { title, href, comments, canBeStreamed, fileSize, directStreamLink } = processedVideo;

  const message = messageGen(title, href, comments, canBeStreamed, fileSize, directStreamLink);

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
};

/**
 * Fetch videos from feed
 * @returns {Promise<Array>} - Array of video objects
 */
const fetchVideosFromFeed = async () => {
  try {
    const response = await fetch(darwinConfig.feedUrl, {
      headers: { "User-Agent": "darwin" },
      // headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36" }
    });

    const html = await response.text();
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
};

/**
 * Run the Darwin process for all configured guilds
 * @param {Object} client - Discord client
 * @returns {Promise<void>}
 */
export const runDarwinProcess = async (client) => {
  try {
    // Test curl functionality before starting
    console.log("🔧 Verifying curl setup...");
    const curlInfo = getCurlInfo();
    console.log(`Curl info:`, curlInfo);

    const curlWorking = await testCurl();
    if (!curlWorking) {
      console.error("❌ Curl test failed - cannot proceed with downloads");
      return;
    }

    // Get all guild configurations
    const guildConfigs = await query("SELECT * FROM configDarwin");

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

            // If video wasn't downloaded, distribute immediately
            if (!result.canBeStreamed) {
              await distributeVideo(client, guildConfigs, result);
            }
          }
        } finally {
          activeTasks--;
          if (videoIndex < videosToProcess.length) {
            processNextVideos();
          }
        }

        // Increased delay between video processing to reduce detection
        if (videoIndex < videosToProcess.length) {
          const processingDelay = 1000 + Math.random() * 2000; // 1-3 seconds
          await new Promise((resolve) => setTimeout(resolve, processingDelay));
        }
      }
    }

    await processNextVideos();

    // Wait for all processing to complete
    while (activeTasks > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Filter out videos that weren't downloaded (already distributed)
    const videosToDistribute = processedVideos.filter((video) => video.canBeStreamed);
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
};
