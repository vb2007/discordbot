import { spawn } from "child_process";
import fs from "fs";
import { execSync } from "child_process";

/**
 * Browser fingerprint configurations for randomization
 */
const BROWSER_CONFIGS = [
  {
    name: "Chrome 120 Windows",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    headers: {
      accept: "video/mp4,video/*,application/octet-stream,*/*;q=0.8",
      acceptLanguage: "en-US,en;q=0.9",
      secFetchSite: "cross-site",
    },
  },
  {
    name: "Chrome 119 macOS",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    headers: {
      accept: "video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5",
      acceptLanguage: "en-US,en;q=0.9",
      secFetchSite: "same-origin",
    },
  },
  {
    name: "Chrome 118 Linux",
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    headers: {
      accept: "*/*",
      acceptLanguage: "en-US,en;q=0.8,de;q=0.6",
      secFetchSite: "cross-site",
    },
  },
  {
    name: "Firefox 120",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
    headers: {
      accept: "video/*,audio/*,*/*;q=0.8",
      acceptLanguage: "en-US,en;q=0.5",
      secFetchSite: "same-origin",
    },
  },
  {
    name: "Safari-like Chrome",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
    headers: {
      accept: "video/mp4,video/*,*/*;q=0.8",
      acceptLanguage: "en-GB,en-US;q=0.9,en;q=0.8",
      secFetchSite: "cross-site",
    },
  },
];

/**
 * Additional header variations for randomization
 */
const HEADER_VARIATIONS = {
  acceptEncodings: ["identity", "gzip, deflate, br", "gzip, deflate", "br, gzip, deflate"],
  cacheControls: ["no-cache", "no-cache, no-store", "max-age=0", "no-cache, max-age=0"],
  connections: ["keep-alive", "close"],
  rateLimits: ["5M", "8M", "10M", "12M", "15M"],
};

/**
 * Find the correct curl executable path
 * @returns {string} Path to curl executable
 */
const findCurlPath = () => {
  const possiblePaths = [
    "/usr/local/bin/curl",
    "/usr/bin/curl",
    "/opt/homebrew/bin/curl",
    "curl", // system PATH
  ];

  for (const path of possiblePaths) {
    try {
      if (path === "curl") {
        // Check if curl is in PATH
        execSync("which curl", { stdio: "ignore" });
        return "curl";
      } else {
        // Check if file exists and is executable
        if (fs.existsSync(path)) {
          return path;
        }
      }
    } catch (error) {
      // Continue to next path
    }
  }

  // Default fallback
  return "curl";
};

/**
 * Verify curl capabilities synchronously
 * @param {string} curlPath - Path to curl executable
 * @returns {Object} Curl capabilities info
 */
const verifyCurlCapabilities = (curlPath) => {
  try {
    const result = execSync(`${curlPath} --version`, { encoding: "utf8", timeout: 5000 });
    const versionMatch = result.match(/curl\s+([^\s]+)/);
    const version = versionMatch ? versionMatch[1] : "unknown";

    return {
      version,
      hasHTTP2: result.includes("HTTP2"),
      hasHTTP3: result.includes("HTTP3"),
      hasTLS13: result.includes("TLS"),
      hasBrotli: result.includes("brotli"),
      working: true,
    };
  } catch (error) {
    return { working: false, error: error.message };
  }
};

// Cache the curl path and verify capabilities on module load
const CURL_PATH = findCurlPath();
const CURL_CAPABILITIES = verifyCurlCapabilities(CURL_PATH);

if (CURL_CAPABILITIES.working) {
  console.log(`✅ Using curl ${CURL_CAPABILITIES.version} at: ${CURL_PATH}`);
  console.log(
    `Features: HTTP2=${CURL_CAPABILITIES.hasHTTP2}, HTTP3=${CURL_CAPABILITIES.hasHTTP3}, Brotli=${CURL_CAPABILITIES.hasBrotli}`
  );
} else {
  console.error(`❌ Curl verification failed: ${CURL_CAPABILITIES.error}`);
  console.error(`Please ensure curl is properly installed and accessible`);
}

/**
 * Test curl with a simple request
 * @returns {Promise<boolean>} Whether curl is working
 */
export const testCurl = async () => {
  return new Promise((resolve) => {
    console.log("🧪 Testing curl functionality...");
    const curl = spawn(CURL_PATH, ["-s", "-I", "https://httpbin.org/get"]);
    let stderr = "";

    curl.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    curl.on("close", (code) => {
      if (code === 0) {
        console.log("✅ Curl test successful");
        resolve(true);
      } else {
        console.error(`❌ Curl test failed with code ${code}: ${stderr}`);
        resolve(false);
      }
    });

    curl.on("error", (error) => {
      console.error(`❌ Curl test error: ${error.message}`);
      resolve(false);
    });
  });
};

/**
 * Get curl information for debugging
 * @returns {Object} Curl path and capabilities
 */
export const getCurlInfo = () => {
  return {
    path: CURL_PATH,
    capabilities: CURL_CAPABILITIES,
  };
};

/**
 * Generate a randomized request configuration to evade fingerprinting
 * @returns {Object} Configuration object with curl args and timing
 */
export const generateRandomRequestConfig = () => {
  const config = BROWSER_CONFIGS[Math.floor(Math.random() * BROWSER_CONFIGS.length)];

  // Add randomized variations
  const variations = {
    acceptEncoding:
      HEADER_VARIATIONS.acceptEncodings[
        Math.floor(Math.random() * HEADER_VARIATIONS.acceptEncodings.length)
      ],
    cacheControl:
      HEADER_VARIATIONS.cacheControls[
        Math.floor(Math.random() * HEADER_VARIATIONS.cacheControls.length)
      ],
    connection:
      HEADER_VARIATIONS.connections[
        Math.floor(Math.random() * HEADER_VARIATIONS.connections.length)
      ],
    rateLimit:
      HEADER_VARIATIONS.rateLimits[Math.floor(Math.random() * HEADER_VARIATIONS.rateLimits.length)],
  };

  // Random timing
  const timing = {
    preDelay: 1000 + Math.random() * 3000, // 1-4 seconds
    keepaliveTime: Math.floor(60 + Math.random() * 60), // 60-120 seconds
    connectTimeout: Math.floor(20 + Math.random() * 20), // 20-40 seconds
    maxTime: Math.floor(250 + Math.random() * 100), // 250-350 seconds
  };

  // Optional headers (randomly included)
  const optionalHeaders = {
    includeUpgradeInsecure: Math.random() > 0.5,
    includeDNT: Math.random() > 0.6,
    includeSecFetchDest: Math.random() > 0.4,
    includeSecFetchMode: Math.random() > 0.5,
    includePragma: Math.random() > 0.7,
  };

  return {
    ...config,
    variations,
    timing,
    optionalHeaders,
    sessionId: Math.random().toString(36).substring(2, 15),
  };
};

/**
 * Create adaptive curl configuration based on system capabilities
 * @param {string} url - Video URL
 * @param {string} referer - Referer URL
 * @param {string} outputPath - Output file path
 * @returns {Array} Curl arguments array
 */
const createAdaptiveCurlArgs = (url, referer, outputPath) => {
  // Base arguments that work across systems
  const baseArgs = [
    "-L", // Follow redirects
    "-s", // Silent mode to reduce noise
    "--max-redirs",
    "5",
    "--connect-timeout",
    "30",
    "--max-time",
    "300",

    // Core headers that match successful dev PC behavior
    "-A",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
    "-H",
    "Accept: video/mp4,video/*,application/octet-stream,*/*;q=0.8",
    "-H",
    "Accept-Language: en-US,en;q=0.5",
    "-H",
    "Accept-Encoding: identity",
    "-H",
    `Referer: ${referer}`,

    "-o",
    outputPath,
    url,
  ];

  // Try enhanced options that work on newer systems
  if (CURL_CAPABILITIES.hasHTTP2) {
    baseArgs.splice(-3, 0, "--http2");
  }

  if (CURL_CAPABILITIES.hasBrotli) {
    baseArgs.splice(-3, 0, "--compressed");
  }

  return baseArgs;
};

/**
 * Download video with system-adaptive approach
 * @param {string} url - Video URL
 * @param {string} referer - Referer URL (comments page)
 * @param {string} outputPath - Where to save the file
 * @param {number} attempt - Current attempt number (for logging)
 * @returns {Promise<boolean>} - Whether download was successful
 */
const downloadVideoWithRandomizedCurl = async (url, referer, outputPath, attempt = 1) => {
  return new Promise((resolve, reject) => {
    const curlArgs = createAdaptiveCurlArgs(url, referer, outputPath);

    console.log(
      `[Attempt ${attempt}] Adaptive download (${CURL_CAPABILITIES.hasHTTP2 ? "HTTP2" : "HTTP1"}, ${CURL_CAPABILITIES.version})`
    );

    const curl = spawn(CURL_PATH, curlArgs);
    let stderr = "";

    curl.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    curl.on("close", (code) => {
      // Log any curl errors for debugging
      if (code !== 0) {
        console.log(`Curl exit code: ${code}`);
        if (stderr) {
          console.log(`Curl error: ${stderr.substring(0, 200)}...`);
        }
      }

      try {
        const stats = fs.statSync(outputPath);

        if (stats.size === 0) {
          console.log(`❌ [Attempt ${attempt}] Downloaded empty file`);
          reject(new Error(`Downloaded empty file`));
          return;
        }

        // Validate file content
        const fileBuffer = fs.readFileSync(outputPath, { start: 0, end: 100 });

        // Check for HTML error pages (Cloudflare blocking)
        const fileStart = fileBuffer.toString("utf8", 0, 50);
        if (
          fileStart.includes("<!DOCTYPE") ||
          fileStart.includes("<html") ||
          fileStart.includes("<HTML")
        ) {
          console.log(`❌ [Attempt ${attempt}] Downloaded HTML error page instead of video`);
          reject(new Error(`Server returned HTML error page - likely blocked`));
          return;
        }

        // Check for valid video format
        const hasMP4Header =
          fileBuffer.includes(Buffer.from([0x00, 0x00, 0x00])) &&
          (fileBuffer.includes(Buffer.from("ftyp")) || fileBuffer.includes(Buffer.from("moov")));

        if (!hasMP4Header) {
          console.log(`❌ [Attempt ${attempt}] File is not a valid video format`);
          reject(new Error(`Downloaded file is not a valid video format`));
          return;
        }

        if (code === 0) {
          const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
          console.log(`✅ [Attempt ${attempt}] Successfully downloaded ${sizeMB}MB video`);
          resolve(true);
        } else {
          reject(new Error(`curl exited with code ${code}: ${stderr}`));
        }
      } catch (statError) {
        console.log(`❌ [Attempt ${attempt}] File validation failed: ${statError.message}`);
        reject(new Error(`File validation failed: ${statError.message}`));
      }
    });

    curl.on("error", (error) => {
      console.log(`❌ [Attempt ${attempt}] Curl process error: ${error.message}`);
      reject(new Error(`Curl execution failed: ${error.message}`));
    });
  });
};

/**
 * Download with retry logic using different fingerprints
 * @param {string} url - Video URL
 * @param {string} referer - Referer URL
 * @param {string} outputPath - Output file path
 * @param {number} maxAttempts - Maximum number of attempts
 * @returns {Promise<boolean>} - Whether download was successful
 */
export const downloadWithRetry = async (url, referer, outputPath, maxAttempts = 3) => {
  // Try different strategies on each attempt
  const strategies = [
    { name: "Direct", delay: 0 },
    { name: "With session delay", delay: 2000 },
    { name: "Fallback mode", delay: 5000 },
  ];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const strategy = strategies[Math.min(attempt - 1, strategies.length - 1)];
      console.log(`Download attempt ${attempt}/${maxAttempts} - Strategy: ${strategy.name}`);

      // Clean up any previous partial download
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }

      // Apply strategy-specific delay
      if (strategy.delay > 0) {
        console.log(`Applying ${strategy.delay}ms delay for strategy: ${strategy.name}`);
        await new Promise((resolve) => setTimeout(resolve, strategy.delay));
      }

      await downloadVideoWithRandomizedCurl(url, referer, outputPath, attempt);
      console.log(`✅ Success with strategy: ${strategy.name}`);
      return true; // Success!
    } catch (error) {
      console.log(`❌ Attempt ${attempt} failed: ${error.message}`);

      if (attempt === maxAttempts) {
        console.error(`All ${maxAttempts} download attempts failed`);

        // Enhanced error reporting
        if (error.message.includes("HTML error page")) {
          throw new Error(
            `Server consistently blocking requests - received HTML instead of video after ${maxAttempts} attempts`
          );
        } else if (error.message.includes("empty file")) {
          throw new Error(
            `Server returning empty responses - possible network or authentication issue`
          );
        } else {
          throw new Error(`Download failed after ${maxAttempts} attempts: ${error.message}`);
        }
      }

      // Clean up failed attempt
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    }
  }
};

/**
 * Get file size using randomized HEAD request
 * @param {string} url - Video URL
 * @param {string} referer - Referer URL
 * @returns {Promise<number|null>} - File size in bytes or null if failed
 */
export const getFileSizeWithRandomizedCurl = async (url, referer) => {
  return new Promise((resolve) => {
    // Create adaptive HEAD request
    const curlArgs = [
      "-I", // HEAD request only
      "-L", // Follow redirects
      "-s", // Silent mode
      "--connect-timeout",
      "20",
      "--max-time",
      "60",
      "--max-redirs",
      "3",

      // Core headers
      "-A",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      "-H",
      "Accept: video/mp4,video/*,application/octet-stream,*/*;q=0.8",
      "-H",
      "Accept-Language: en-US,en;q=0.5",
      "-H",
      `Referer: ${referer}`,

      url,
    ];

    // Add HTTP/2 if supported
    if (CURL_CAPABILITIES.hasHTTP2) {
      curlArgs.splice(-1, 0, "--http2");
    }

    const curl = spawn(CURL_PATH, curlArgs);
    let stdout = "";

    curl.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    curl.on("close", (code) => {
      if (code === 0 && !stdout.includes("403") && !stdout.includes("Forbidden")) {
        const match = stdout.match(/content-length:\s*(\d+)/i);
        const fileSize = match ? parseInt(match[1], 10) : null;
        resolve(fileSize);
      } else {
        // Don't log failures for HEAD requests - they often fail but downloads still work
        resolve(null);
      }
    });

    curl.on("error", () => {
      resolve(null);
    });
  });
};

/**
 * Establish a browser session by visiting the referrer page first
 * @param {string} referer - The referrer URL to visit
 * @returns {Promise<boolean>} - Whether session establishment was successful
 */
export const establishSession = async (referer) => {
  return new Promise((resolve) => {
    // Create adaptive session establishment
    const curlArgs = [
      "-L", // Follow redirects
      "-s", // Silent mode
      "--connect-timeout",
      "20",
      "--max-time",
      "60",
      "--max-redirs",
      "3",

      // Browser headers for page visits
      "-A",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      "-H",
      "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "-H",
      "Accept-Language: en-US,en;q=0.5",
      "-H",
      "Cache-Control: no-cache",
      "-H",
      "Upgrade-Insecure-Requests: 1",

      "-o",
      "/dev/null",
      referer,
    ];

    // Add enhanced features if available
    if (CURL_CAPABILITIES.hasHTTP2) {
      curlArgs.splice(-2, 0, "--http2");
    }
    if (CURL_CAPABILITIES.hasBrotli) {
      curlArgs.splice(-2, 0, "--compressed");
      curlArgs.splice(-2, 0, "-H", "Accept-Encoding: gzip, deflate, br");
    }

    console.log(`Establishing session by visiting: ${referer.substring(0, 50)}...`);

    const curl = spawn(CURL_PATH, curlArgs);

    curl.on("close", (code) => {
      if (code === 0) {
        console.log("✅ Session established successfully");
        resolve(true);
      } else {
        console.log("⚠️ Session establishment failed, continuing anyway");
        resolve(false);
      }
    });

    curl.on("error", () => {
      console.log("⚠️ Session establishment error, continuing anyway");
      resolve(false);
    });
  });
};
