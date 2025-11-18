# Darwin Video Processing System

This module handles automated video discovery, downloading, transcoding, and distribution from external sources while evading bot detection systems.

## Architecture

### Core Files

- **`darwinProcess.js`** - Main orchestration logic for video processing
- **`darwinTranscode.js`** - Video transcoding and optimization
- **`darwinCache.js`** - Video caching system to prevent duplicates
- **`darwinAntiFingerprint.js`** - Advanced anti-detection system for bypassing Cloudflare

## Anti-Fingerprinting System

### Overview

The `darwinAntiFingerprint.js` module implements sophisticated techniques to bypass Cloudflare's bot detection by randomizing TLS fingerprints and browser characteristics.

### Key Features

#### 1. **TLS Fingerprint Randomization**
- Rotates between different cipher suites and elliptic curves
- Mimics various browser TLS implementations
- Changes SSL/TLS handshake patterns

#### 2. **Browser Fingerprint Simulation**
- Multiple realistic browser configurations (Chrome, Firefox, Safari)
- Randomized User-Agent strings
- Platform-specific header patterns (Windows, macOS, Linux)

#### 3. **Request Pattern Obfuscation**
- Random timing delays between requests (1-4 seconds)
- Variable rate limiting (5-15 MB/s)
- Progressive retry delays with new fingerprints

#### 4. **Session Establishment**
- Visits referrer pages before downloading videos
- Mimics human browsing behavior
- Maintains realistic request flow

### Browser Configurations

The system rotates between these browser fingerprints:

1. **Chrome 120 Windows** - Most common configuration
2. **Chrome 119 macOS** - Alternative Chrome version
3. **Chrome 118 Linux** - Linux-specific Chrome
4. **Firefox 120** - Different engine fingerprint
5. **Safari-like Chrome** - WebKit-based fingerprint

### Detection Evasion Techniques

#### TLS Randomization
```javascript
// Example cipher rotation
"TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_AES_128_GCM_SHA256"
"TLS_CHACHA20_POLY1305_SHA256:TLS_AES_256_GCM_SHA384:TLS_AES_128_GCM_SHA256"
"TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256"
```

#### Request Headers Variation
- Accept headers that match browser type
- Randomized Accept-Language preferences
- Variable Accept-Encoding support
- Optional security headers (Sec-Fetch-*)

#### Timing Patterns
- Pre-request delays: 1-4 seconds
- Retry delays: Progressive (3-7 seconds)
- Session establishment: 1-3 seconds
- Processing delays: 1-3 seconds between videos

### Usage

#### Download with Anti-Fingerprinting
```javascript
import { downloadWithRetry } from './darwinAntiFingerprint.js';

// Attempts download with up to 3 different fingerprints
await downloadWithRetry(videoUrl, refererUrl, outputPath, 3);
```

#### File Size Check
```javascript
import { getFileSizeWithRandomizedCurl } from './darwinAntiFingerprint.js';

// Uses randomized fingerprint for HEAD request
const fileSize = await getFileSizeWithRandomizedCurl(videoUrl, refererUrl);
```

#### Session Establishment
```javascript
import { establishSession } from './darwinAntiFingerprint.js';

// Visits page like a real browser before downloading
await establishSession(refererUrl);
```

## Configuration

### Environment Variables
The system uses configuration from `config.json`:

```json
{
  "darwin": {
    "tempDir": "/path/to/temp",
    "targetDir": "/path/to/final",
    "cdnUrl": "https://your-cdn.com",
    "maxDownloadSize": 50,
    "feedUrl": "https://source-site.com/feed",
    "markerOne": "video_marker_1",
    "markerTwo": "https://source-site.com"
  }
}
```

## Deployment Considerations

### Curl Requirements
- Requires curl 8.x+ with modern TLS support
- OpenSSL 3.x+ for advanced cipher suites
- HTTP/2 and HTTP/3 support recommended

### Performance
- Each download attempt includes 1-4 second delays
- Progressive retry delays for failed attempts
- Rate limiting prevents bandwidth saturation

### Monitoring
The system logs detailed information about:
- Fingerprint selection and success rates
- Blocking detection and retry attempts
- Download success/failure patterns
- TLS configuration effectiveness

## Troubleshooting

### Common Issues

#### 403 Forbidden Errors
- Indicates fingerprint detection
- System automatically retries with different fingerprints
- Check curl version and TLS support

#### Empty Downloads (0 bytes)
- Usually HTML error pages instead of video
- Triggers automatic retry with new configuration
- May indicate IP-based blocking

#### TLS Handshake Failures
- Check OpenSSL version compatibility
- Verify cipher suite support
- Update curl to latest version

### Debug Mode
Enable verbose logging by modifying the curl args to include `-v` for detailed TLS handshake information.

## Security Notes

- All requests use legitimate browser fingerprints
- No malicious techniques are employed
- Respects rate limiting and server resources
- Designed to appear as normal browser traffic