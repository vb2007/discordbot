const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

/**
 * Get video information including dimensions and duration
 * @param {string} inputPath - Path to the video file
 * @returns {Promise<Object>} - Video metadata object
 */
function getVideoInfo(inputPath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputPath, (err, metadata) => {
            if (err) {
                return reject(err);
            }
            
            const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
            if (!videoStream) {
                return reject(new Error('No video stream found'));
            }
            
            resolve({
                width: videoStream.width,
                height: videoStream.height,
                duration: videoStream.duration,
                bitrate: videoStream.bit_rate,
                rotation: videoStream.tags && videoStream.tags.rotate ? parseInt(videoStream.tags.rotate) : 0
            });
        });
    });
}

/**
 * Transcode video to reduce file size while maintaining Discord compatibility
 * Preserves aspect ratio and uses hardware acceleration when available
 * @param {string} inputPath - Path to the input video file
 * @param {string} outputPath - Path for the transcoded output file
 * @returns {Promise<boolean>} - Whether transcoding was successful
 */
async function transcodeVideo(inputPath, outputPath) {
    try {
        // Get original video dimensions
        const videoInfo = await getVideoInfo(inputPath);
        console.log(`Original video: ${videoInfo.width}x${videoInfo.height}, rotation: ${videoInfo.rotation}°`);
        
        // Determine if video is portrait or landscape (accounting for rotation)
        const isVertical = 
            (videoInfo.rotation === 0 || videoInfo.rotation === 180) ? videoInfo.height > videoInfo.width 
                                                                      : videoInfo.width > videoInfo.height;
        
        // Set maximum dimensions based on orientation
        const maxWidth = isVertical ? 720 : 1920;
        const maxHeight = isVertical ? 1280 : 1080;
        
        console.log(`Video orientation: ${isVertical ? 'vertical' : 'horizontal'}, using max dimensions: ${maxWidth}x${maxHeight}`);
        
        return new Promise((resolve, reject) => {
            console.log(`Starting transcoding: ${inputPath} -> ${outputPath}`);
            
            // Try to detect if hardware acceleration is available
            const useHardwareAcceleration = true; // We can make this smarter by detecting availability
            
            let ffmpegCommand = ffmpeg(inputPath);
            
            if (useHardwareAcceleration) {
                console.log('Attempting to use Intel QuickSync hardware acceleration');
                ffmpegCommand
                    .inputOptions(['-hwaccel qsv', '-hwaccel_output_format qsv'])
                    .videoCodec('h264_qsv');
            } else {
                ffmpegCommand.videoCodec('libx264');
            }
            
            ffmpegCommand
                .audioCodec('aac')
                .outputOptions([
                    '-crf 26',
                    useHardwareAcceleration ? '-preset:v medium' : '-preset fast',
                    '-profile:v main',
                    '-level 4.1',
                    '-movflags +faststart',
                    '-b:a 128k',
                    '-map_metadata -1'
                ])
                // Use scale filter to maintain aspect ratio
                .outputOptions([
                    `-vf scale='min(${maxWidth},iw)':min'(${maxHeight},ih):force_original_aspect_ratio=decrease'`
                ])
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
                    
                    // If hardware acceleration fails, try again with software encoding
                    if (useHardwareAcceleration && err.message.includes('qsv')) {
                        console.log('Hardware acceleration failed, falling back to software encoding...');
                        transcodeVideoSoftware(inputPath, outputPath, maxWidth, maxHeight)
                            .then(resolve)
                            .catch(reject);
                    } else {
                        reject(err);
                    }
                })
                .save(outputPath);
        });
    } catch (error) {
        console.error(`Error in transcodeVideo: ${error.message}`);
        // Fall back to software encoding if metadata extraction fails
        return transcodeVideoSoftware(inputPath, outputPath, 1920, 1080);
    }
}

/**
 * Fallback software transcoding when hardware acceleration fails
 * @param {string} inputPath - Path to the input video file
 * @param {string} outputPath - Path for the transcoded output file
 * @param {number} maxWidth - Maximum width for the output video
 * @param {number} maxHeight - Maximum height for the output video
 * @returns {Promise<boolean>} - Whether transcoding was successful
 */
function transcodeVideoSoftware(inputPath, outputPath, maxWidth = 1920, maxHeight = 1080) {
    return new Promise((resolve, reject) => {
        console.log(`Starting software transcoding: ${inputPath} -> ${outputPath}`);
        
        ffmpeg(inputPath)
            .videoCodec('libx264')
            .audioCodec('aac')
            .outputOptions([
                '-crf 26',
                '-preset fast',
                '-profile:v main',
                '-level 3.1',
                '-movflags +faststart',
                '-b:a 128k',
                '-map_metadata -1',
                `-vf scale='min(${maxWidth},iw)':min'(${maxHeight},ih):force_original_aspect_ratio=decrease'`
            ])
            .on('progress', (progress) => {
                if (progress.percent) {
                    console.log(`Transcoding progress: ${Math.round(progress.percent)}%`);
                }
            })
            .on('end', () => {
                console.log(`Software transcoding completed: ${outputPath}`);
                resolve(true);
            })
            .on('error', (err) => {
                console.error(`Software transcoding failed: ${err.message}`);
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

module.exports = {
    transcodeVideo,
    getFileSizeMB,
    getVideoInfo
};
