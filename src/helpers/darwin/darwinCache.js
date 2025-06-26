const db = require("../db");

/**
 * Add a URL to the Darwin cache
 * @param {string} url - The video URL to cache
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
async function addToCache(url) {
    try {        
        const exists = await isInCache(url);
        if (exists) {
            console.log(`URL already in cache: ${url}`);
            return true;
        }
        
        console.log(`Adding "${url}" to Darwin cache`);
        await db.query("INSERT INTO darwinCache (videoUrl) VALUES (?)", [url]);
        return true;
    }
    catch (error) {
        console.error(`Failed to add URL to Darwin cache: ${error}`);
        return false;
    }
}

/**
 * Check if a URL exists in the Darwin cache
 * @param {string} url - The video URL to check
 * @returns {Promise<boolean>} - Whether the URL exists in cache
 */
async function isInCache(url) {
    try {
        console.log(`Checking "${url}" in Darwin cache`);
        const result = await db.query("SELECT videoUrl FROM darwinCache WHERE videoUrl = ?", [url]);
        return result.length > 0;
    }
    catch (error) {
        console.error(`Failed to check URL in Darwin cache: ${error}`);
        return false;
    }
}

/**
 * Mark a video as being processed to prevent duplicates during concurrent processing
 * @param {string} url - The video URL to mark
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
async function markAsProcessing(url) {
    return await addToCache(url);
}

module.exports = {
    addToCache,
    isInCache,
    normalizeUrl,
    // markAsProcessing
};