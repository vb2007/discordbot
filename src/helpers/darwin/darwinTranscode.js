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
 * Determine video format based on dimensions
 * @param {Object} videoInfo - Video metadata
 * @returns {Object} - Format details including type and dimensions
 */
function determineVideoFormat(videoInfo) {
    const { width, height, rotation } = videoInfo;
    
    const effectiveWidth = (rotation === 90 || rotation === 270) ? height : width;
    const effectiveHeight = (rotation === 90 || rotation === 270) ? width : height;
    
    const aspectRatio = effectiveWidth / effectiveHeight;
    
    let format = {
        type: 'unknown',
        maxWidth: 1280,
        maxHeight: 720
    };
    
    if (Math.abs(aspectRatio - 1) < 0.1) {
        format.type = 'square';
        format.maxWidth = 1080;
        format.maxHeight = 1080;
    } else if (aspectRatio > 1) {
        format.type = 'landscape';
        format.maxWidth = 1920;
        format.maxHeight = 1080;
    } else {
        format.type = 'portrait';
        format.maxWidth = 720;
        format.maxHeight = 1280;
    }
    
    console.log(`Determined video format: ${format.type} (${effectiveWidth}x${effectiveHeight}, ratio: ${aspectRatio.toFixed(2)})`);
    
    return format;
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
        
        // Determine video format and optimal dimensions
        const format = determineVideoFormat(videoInfo);
        
        console.log(`Using max dimensions: ${format.maxWidth}x${format.maxHeight} for ${format.type} video`);
        
        // Check if hardware acceleration is available
        const useHardwareAcceleration = await checkHardwareAcceleration();
        
        if (useHardwareAcceleration) {
            try {
                console.log('Using Intel QuickSync hardware acceleration');
                const success = await transcodeWithHardwareAcceleration(inputPath, outputPath, format, videoInfo);
                if (success) return true;
                
                // If hardware acceleration failed, fall back to software
                console.log('Hardware acceleration failed or was unavailable, falling back to software encoding');
            } catch (error) {
                console.error(`Hardware acceleration error: ${error.message}`);
                console.log('Falling back to software encoding');
            }
        }
        
        // Software transcoding as fallback
        return await transcodeVideoSoftware(inputPath, outputPath, format.maxWidth, format.maxHeight, videoInfo);
        
    } catch (error) {
        console.error(`Error in transcodeVideo: ${error.message}`);
        // Last resort fallback
        try {
            return await transcodeVideoSoftware(inputPath, outputPath, 1280, 720);
        } catch (finalError) {
            console.error(`Final transcoding attempt failed: ${finalError.message}`);
            throw finalError;
        }
    }
}

/**
 * Check if hardware acceleration is available
 * @returns {Promise<boolean>} - Whether hardware acceleration is available
 */
async function checkHardwareAcceleration() {
    return new Promise((resolve) => {
        // Run a quick test to see if qsv is available
        const proc = require('child_process').spawn('ffmpeg', ['-hwaccels']);
        let output = '';
        
        proc.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        proc.on('close', (code) => {
            const hasQSV = output.toLowerCase().includes('qsv');
            console.log(`Hardware acceleration check: QSV ${hasQSV ? 'available' : 'not available'}`);
            resolve(hasQSV);
        });
        
        // If it takes too long, assume it's not available
        setTimeout(() => {
            console.log('Hardware acceleration check timed out, assuming not available');
            resolve(false);
        }, 2000);
    });
}

/**
 * Transcode video using hardware acceleration
 * @param {string} inputPath - Path to the input video file
 * @param {string} outputPath - Path for the transcoded output file
 * @param {Object} format - Video format information
 * @param {Object} videoInfo - Original video metadata
 * @returns {Promise<boolean>} - Whether transcoding was successful
 */
async function transcodeWithHardwareAcceleration(inputPath, outputPath, format, videoInfo) {
    return new Promise((resolve, reject) => {
        console.log(`Starting hardware transcoding: ${inputPath} -> ${outputPath}`);
        
        const command = ffmpeg(inputPath)
            .inputOptions(['-hwaccel qsv', '-hwaccel_output_format qsv'])
            .videoCodec('h264_qsv')
            .audioCodec('aac')
            .outputOptions([
                '-crf 26',
                '-preset:v medium',
                '-profile:v main',
                '-level 4.1',
                '-movflags +faststart',
                '-b:a 128k',
                '-map_metadata -1'
            ])
            .outputOptions([
                `-vf scale='min(${format.maxWidth},iw)':min'(${format.maxHeight},ih):force_original_aspect_ratio=decrease'`
            ])
            .on('progress', (progress) => {
                if (progress.percent) {
                    console.log(`Hardware transcoding progress: ${Math.round(progress.percent)}%`);
                }
            })
            .on('end', () => {
                console.log(`Hardware transcoding completed: ${outputPath}`);
                resolve(true);
            })
            .on('error', (err) => {
                console.error(`Hardware transcoding failed: ${err.message}`);
                resolve(false); // Resolve false to try software encoding instead of rejecting
            });
        
        command.save(outputPath);
    });
}

/**
 * Transcode video using software encoding
 * @param {string} inputPath - Path to the input video file
 * @param {string} outputPath - Path for the transcoded output file
 * @param {number} maxWidth - Maximum width for the output video
 * @param {number} maxHeight - Maximum height for the output video
 * @param {Object} [videoInfo] - Original video metadata if available
 * @returns {Promise<boolean>} - Whether transcoding was successful
 */
async function transcodeVideoSoftware(inputPath, outputPath, maxWidth = 1280, maxHeight = 720, videoInfo = null) {
    return new Promise((resolve, reject) => {
        console.log(`Starting software transcoding: ${inputPath} -> ${outputPath}`);
        
        // Calculate optimal CRF based on resolution
        let crf = 26; // Default value
        
        if (videoInfo) {
            const totalPixels = videoInfo.width * videoInfo.height;
            // Adjust CRF based on resolution - higher resolution can use higher CRF
            if (totalPixels > 2073600) { // > 1080p
                crf = 28;
            } else if (totalPixels < 409920) { // < 480p
                crf = 23;
            }
        }
        
        console.log(`Using CRF value: ${crf} for quality/size optimization`);
        
        ffmpeg(inputPath)
            .videoCodec('libx264')
            .audioCodec('aac')
            .outputOptions([
                `-crf ${crf}`,
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
    getVideoInfo,
    determineVideoFormat
};
