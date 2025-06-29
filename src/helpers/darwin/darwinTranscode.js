const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

/**
 * Transcode video to reduce file size while maintaining Discord compatibility
 * @param {string} inputPath - Path to the input video file
 * @param {string} outputPath - Path for the transcoded output file
 * @returns {Promise<boolean>} - Whether transcoding was successful
 */
async function transcodeVideo(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        console.log(`Starting transcoding: ${inputPath} -> ${outputPath}`);
        
        ffmpeg(inputPath)
            //best compatibility for discord
            .videoCodec('libx264')
            .audioCodec('aac')
            //CRF 23-28 : quality/size balance -> lower = better quality, bigger size
            .outputOptions([
                '-crf 26',
                '-preset fast',
                '-profile:v main',
                '-level 3.1',
                '-movflags +faststart',
                '-b:a 128k',
                '-map_metadata -1'
            ])
            .size('1920x1080')
            .on('progress', (progress) => {
                if (progress.percent) {
                    console.log(`Transcoding progress: ${Math.round(progress.percent)}%`);
                }
            })
            .on('end', () => {
                console.log(`Transcoding completed: ${outputPath}`);
                resolve(true);
            })
            .on('error', (err) => {
                console.error(`Transcoding failed: ${err.message}`);
                reject(err);
            })
            .save(outputPath);
    });
}

/**
 * Get video file size in MB
 * @param {string} filePath - Path to the video file
 * @returns {number} - File size in MB
 */
function getFileSizeMB(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return (stats.size / (1024 * 1024)).toFixed(2);
    } catch (error) {
        console.error(`Failed to get file size: ${error}`);
        return 0;
    }
}

/**
 * Clean up temporary files
 * @param {string[]} filePaths - Array of file paths to delete
 */
function cleanupFiles(filePaths) {
    filePaths.forEach(filePath => {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Cleaned up temporary file: ${filePath}`);
            }
        } catch (error) {
            console.error(`Failed to cleanup file ${filePath}: ${error}`);
        }
    });
}

module.exports = {
    transcodeVideo,
    getFileSizeMB,
    cleanupFiles
};
