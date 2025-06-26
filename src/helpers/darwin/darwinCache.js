const db = require("../db");

/**
 * Add a URL to Darwin's cache
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

        console.log(`Adding "${url}" to Darwin's cache`);
        await db.query("INSERT INTO darwinCache (videoUrl) VALUES (?)", [url]);
        return true;
    }
    catch (error) {
        console.error(`Failed to add URL to Darwin's cache: ${error}`);
        return false;
    }
}

/**
 * Check if a URL exists in Darwin's cache
 * @param {string} url - The video URL to check
 * @returns {Promise<boolean>} - Whether the URL exists in cache
 */
async function isInCache(url) {
    try {
        console.log(`Checking "${url}" in Darwin's cache`);
        const result = await db.query("SELECT videoUrl FROM darwinCache WHERE videoUrl = ?", [url]);
        return result.length > 0;
    }
    catch (error) {
        console.error(`Failed to check URL in Darwin cache: ${error}`);
        return false;
    }
}

module.exports = {
    addToCache,
    isInCache
};