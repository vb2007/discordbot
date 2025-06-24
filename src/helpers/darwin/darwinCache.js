const db = require("../db");

/**
 * Add a URL to the Darwin cache
 * @param {string} url - The video URL to cache
 */
async function addToCache(url) {
    try {
        console.log(`Adding "${url}" to Darwin cache`);
        await db.query("INSERT INTO darwinCache (videoUrl) VALUES (?)", [url]);
        return true;
    } catch (error) {
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
    } catch (error) {
        console.error(`Failed to check URL in Darwin cache: ${error}`);
        return false;
    }
}

module.exports = {
    addToCache,
    isInCache
};