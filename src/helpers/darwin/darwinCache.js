const db = require("../db");

/**
 * Extract a unique video ID from a URL
 * @param {string} url - The video URL
 * @returns {string} - The unique video ID
 */
function extractVideoId(url) {
    try {
        const urlParts = url.split('/');
        const filename = urlParts[urlParts.length - 1];
        
        if (filename.endsWith('.mp4')) {
            return filename.replace('.mp4', '');
        }
        
        return url;
    } catch (error) {
        console.error(`Failed to extract video ID from URL: ${error}`);
        return url;
    }
}

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

        const videoId = extractVideoId(url);
        console.log(`Adding "${url}" (ID: ${videoId}) to Darwin's cache`);
        
        try {
            await db.query(
                "INSERT INTO darwinCache (videoUrl, videoId) VALUES (?, ?)", 
                [url, videoId]
            );
            return true;
        } catch (sqlError) {
            //handle duplicate key error (MySQL error code 1062) (edge case, if source reuses the same id)
            if (sqlError.code === 'ER_DUP_ENTRY') {
                console.log(`Duplicate videoId detected: ${videoId}, skipping to avoid conflict`);
                
                const idExists = await db.query("SELECT id FROM darwinCache WHERE videoId = ?", [videoId]);
                if (idExists.length > 0) {
                    console.log(`Another URL already uses videoId ${videoId}, treating as cached`);
                } else {
                    console.log(`URL ${url} is a duplicate entry`);
                }
                
                return true;
            }
            //re-throw other sql errors
            throw sqlError;
        }
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
        const videoId = extractVideoId(url);
        console.log(`Checking "${url}" (ID: ${videoId}) in Darwin's cache`);
        
        const result = await db.query(
            "SELECT videoUrl FROM darwinCache WHERE videoUrl = ? OR videoId = ?", 
            [url, videoId]
        );
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