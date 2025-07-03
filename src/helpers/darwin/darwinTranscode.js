const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

/**
 * Get video information including dimensions and duration
 * @param {string} inputPath - Path to the video file
 * @returns {Promise<Object>} - Video metadata object
 */
async function getVideoInfo(inputPath) {
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
                rotation: videoStream.tags && videoStream.tags.rotate ? parseInt(videoStream.tags.rotate) : 0,
                codec_name: videoStream.codec_name
            });
        });
    });
}

/**
 * Calculate optimal CRF value based on video resolution
 * @param {number} totalPixels - Total pixels in the video
 * @returns {number} - Optimal CRF value
 */
function calculateOptimalCRF(totalPixels) {
    // Higher resolution can use higher CRF (more compression) while still looking good
    if (totalPixels > 2073600) { // > 1080p
        return 28;
    } else if (totalPixels > 921600) { // > 720p
        return 26;
    } else if (totalPixels > 409920) { // > 480p
        return 24;
    } else { // Lower resolutions need less compression to look good
        return 23;
    }
}

/**
 * Calculate optimal dimensions for transcoding while preserving aspect ratio
 * @param {Object} videoInfo - Original video information
 * @returns {Object} - Calculated dimensions and scaling information
 */
function calculateOptimalDimensions(videoInfo) {
    const { width, height, rotation } = videoInfo;
    
    const effectiveWidth = (rotation === 90 || rotation === 270) ? height : width;
    const effectiveHeight = (rotation === 90 || rotation === 270) ? width : height;
    
    const aspectRatio = effectiveWidth / effectiveHeight;
    const totalPixels = effectiveWidth * effectiveHeight;
    
    // Base limits - only apply if video exceeds these dimensions
    const MAX_WIDTH = 1920;
    const MAX_HEIGHT = 1280;
    const MAX_PIXELS = 2073600; // 1080p equivalent (1920×1080)
    
    // Initialize with original dimensions - don't change unless needed
    let targetWidth = effectiveWidth;
    let targetHeight = effectiveHeight;
    let needsScaling = false;
    
    // Check if we need to scale down
    if (totalPixels > MAX_PIXELS || effectiveWidth > MAX_WIDTH || effectiveHeight > MAX_HEIGHT) {
        needsScaling = true;
        
        // Scale by the most constraining dimension
        if (effectiveWidth / MAX_WIDTH > effectiveHeight / MAX_HEIGHT) {
            // Width is the limiting factor
            targetWidth = MAX_WIDTH;
            targetHeight = Math.round(MAX_WIDTH / aspectRatio);
        } else {
            // Height is the limiting factor
            targetHeight = MAX_HEIGHT;
            targetWidth = Math.round(MAX_HEIGHT * aspectRatio);
        }
        
        // Ensure we don't exceed the pixel count limit
        if (targetWidth * targetHeight > MAX_PIXELS) {
            const scale = Math.sqrt(MAX_PIXELS / (targetWidth * targetHeight));
            targetWidth = Math.round(targetWidth * scale);
            targetHeight = Math.round(targetHeight * scale);
        }
    }
    
    console.log(`Original dimensions: ${effectiveWidth}x${effectiveHeight}, aspect ratio: ${aspectRatio.toFixed(2)}`);
    if (needsScaling) {
        console.log(`Scaling to: ${targetWidth}x${targetHeight}`);
    } else {
        console.log(`Keeping original dimensions: ${targetWidth}x${targetHeight}`);
    }
    
    return {
        width: targetWidth,
        height: targetHeight,
        aspectRatio,
        needsScaling,
        isLandscape: aspectRatio > 1,
        isPortrait: aspectRatio < 1,
        isSquare: Math.abs(aspectRatio - 1) < 0.1,
        totalPixels
    };
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
        console.log(`Original video: ${videoInfo.width}x${videoInfo.height}, rotation: ${videoInfo.rotation}°, codec: ${videoInfo.codec_name}`);
        
        // Calculate optimal dimensions based on actual video properties
        const dimensions = calculateOptimalDimensions(videoInfo);

        return await transcodeVideo(inputPath, outputPath, dimensions, videoInfo);
        
    } catch (error) {
        console.error(`Error in transcodeVideo: ${error.message}`);
        // Last resort fallback with conservative settings
        try {
            console.log('Using conservative fallback settings');
            return await transcodeVideo(inputPath, outputPath, null, null);
        } catch (finalError) {
            console.error(`Final transcoding attempt failed: ${finalError.message}`);
            throw finalError;
        }
    }
}

/**
 * Transcode video using software encoding
 * @param {string} inputPath - Path to the input video file
 * @param {string} outputPath - Path for the transcoded output file
 * @param {Object} dimensions - Calculated video dimensions or null for fallback
 * @param {Object} videoInfo - Original video metadata or null for fallback
 * @returns {Promise<boolean>} - Whether transcoding was successful
 */
async function transcodeVideo(inputPath, outputPath, dimensions, videoInfo) {
    return new Promise((resolve, reject) => {
        console.log(`Starting software transcoding: ${inputPath} -> ${outputPath}`);
        
        // Use conservative defaults if dimensions aren't available
        const crf = dimensions ? calculateOptimalCRF(dimensions.totalPixels) : 26;
        console.log(`Using CRF value: ${crf} for quality/size optimization`);
        
        const command = ffmpeg(inputPath)
            .videoCodec('libx264')
            .audioCodec('aac')
            .outputOptions([
                `-crf ${crf}`,
                '-preset fast',
                '-profile:v main',
                '-level 3.1',
                '-movflags +faststart',
                '-b:a 128k',
                '-map_metadata -1'
            ]);
        
        // Apply scaling only if we have dimensions and scaling is needed
        if (dimensions && dimensions.needsScaling) {
            command.size(`${dimensions.width}x${dimensions.height}`);
        } else if (!dimensions) {
            // Fallback scaling that ensures video isn't too large
            command.outputOptions([
                '-vf scale=\'min(1280,iw):min(720,ih):force_original_aspect_ratio=decrease\'',
            ]);
        }
        
        command
            .on('progress', (progress) => {
                if (progress.percent) {
                    console.log(`Software transcoding progress: ${Math.round(progress.percent)}%`);
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
