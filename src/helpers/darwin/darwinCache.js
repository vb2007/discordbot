import { query } from "../db.js";

/**
 * Extract a unique video ID from a URL
 * @param {string} url - The video URL
 * @returns {string} - The unique video ID
 */
const extractVideoId = (url) => {
  try {
    const urlParts = url.split("/");
    const filename = urlParts[urlParts.length - 1];

    if (filename.endsWith(".mp4")) {
      return filename.replace(".mp4", "");
    }

    return url;
  } catch (error) {
    console.error(`Failed to extract video ID from URL: ${error}`);
    return url;
  }
};

/**
 * Add a video to Darwin's cache
 * @param {string} directVideoUrl - The direct video URL
 * @param {string} forumPostUrl - The forum post URL
 * @param {string} videoTitle - The video title
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
export const addToCache = async (directVideoUrl, forumPostUrl, videoTitle) => {
  try {
    const exists = await isInCache(directVideoUrl);
    if (exists) {
      // console.log(`URL already in cache: ${directVideoUrl}`);
      return true;
    }

    const videoId = extractVideoId(directVideoUrl);
    // console.log(`Adding "${videoTitle}" (ID: ${videoId}) to Darwin's cache`);

    try {
      await query(
        "INSERT INTO darwinCache (directVideoUrl, forumPostUrl, videoId, videoTitle) VALUES (?, ?, ?, ?)",
        [directVideoUrl, forumPostUrl, videoId, videoTitle]
      );
      return true;
    } catch (sqlError) {
      //handle duplicate key error (MySQL error code 1062) (edge case, if source reuses the same id)
      if (sqlError.code === "ER_DUP_ENTRY") {
        console.log(`Duplicate videoId detected: ${videoId}, skipping to avoid conflict`);

        const idExists = await query("SELECT id FROM darwinCache WHERE videoId = ?", [videoId]);
        if (idExists.length > 0) {
          console.log(`Another URL already uses videoId ${videoId}, treating as cached`);
        } else {
          console.log(`URL ${directVideoUrl} is a duplicate entry`);
        }

        return true;
      }
      //re-throw other sql errors
      throw sqlError;
    }
  } catch (error) {
    console.error(`Failed to add URL to Darwin's cache: ${error}`);
    return false;
  }
};

/**
 * Check if a URL exists in Darwin's cache
 * @param {string} url - The video URL to check
 * @returns {Promise<boolean>} - Whether the URL exists in cache
 */
export const isInCache = async (url) => {
  try {
    const videoId = extractVideoId(url);
    // console.log(`Checking "${url}" (ID: ${videoId}) in Darwin's cache`);

    const result = await query(
      "SELECT directVideoUrl FROM darwinCache WHERE directVideoUrl = ? OR videoId = ?",
      [url, videoId]
    );
    return result.length > 0;
  } catch (error) {
    console.error(`Failed to check URL in Darwin cache: ${error}`);
    return false;
  }
};
