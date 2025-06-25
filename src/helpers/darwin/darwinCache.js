const db = require("../db");

/**
 * Normalize a URL to ensure consistent cache checking
 * @param {string} url - The URL to normalize
 * @returns {string} - Normalized URL
 */
function normalizeUrl(url) {
    try {
        if (!url) return '';
        
        let normalized = url.split('?')[0].trim();
        if (normalized.endsWith('/')) {
            normalized = normalized.slice(0, -1);
        }
        
        return normalized.toLowerCase();
    } catch (error) {
        console.error(`URL normalization error: ${error}`);
        return url || '';
    }
}

/**
 * Add a URL to the Darwin cache
 * @param {string} url - The video URL to cache
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
async function addToCache(url) {
    try {
        const normalizedUrl = normalizeUrl(url);
        if (!normalizedUrl) {
            console.error('Cannot add empty URL to cache');
            return false;
        }
        
        const exists = await isInCache(normalizedUrl);
        if (exists) {
            console.log(`URL already in cache: ${url}`);
            return true;
        }
        
        console.log(`Adding "${url}" to Darwin cache`);
        await db.query("INSERT INTO darwinCache (videoUrl) VALUES (?)", [normalizedUrl]);
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
        const normalizedUrl = normalizeUrl(url);
        if (!normalizedUrl) {
            console.error('Cannot check empty URL in cache');
            return false;
        }
        
        console.log(`Checking "${normalizedUrl}" in Darwin cache`);
        const result = await db.query("SELECT videoUrl FROM darwinCache WHERE videoUrl = ?", [normalizedUrl]);
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
    markAsProcessing
};