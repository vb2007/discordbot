#!/usr/bin/env node

/**
 * Script to capture exact dev PC curl behavior for replication on server
 * Run this on your dev PC to capture working curl commands
 * Then run on server to test if same commands work
 */

import { spawn } from "child_process";
import fs from "fs";
import { execSync } from "child_process";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

const log = (color, message) => console.log(`${color}${message}${colors.reset}`);

/**
 * Capture system information that might affect curl behavior
 */
const captureSystemInfo = () => {
  const info = {};

  try {
    info.platform = process.platform;
    info.arch = process.arch;
    info.nodeVersion = process.version;

    // Get OS info
    if (process.platform === 'linux') {
      try {
        info.osRelease = execSync('cat /etc/os-release', { encoding: 'utf8' }).split('\n')[0];
      } catch (e) {
        info.osRelease = 'Unknown Linux';
      }
    }

    // Get curl info
    try {
      info.curlVersion = execSync('curl --version', { encoding: 'utf8' }).split('\n')[0];
    } catch (e) {
      info.curlVersion = 'curl not found';
    }

    // Get OpenSSL info
    try {
      info.opensslVersion = execSync('openssl version', { encoding: 'utf8' }).trim();
    } catch (e) {
      info.opensslVersion = 'openssl not found';
    }

    // Get network interface info (might affect routing)
    try {
      const interfaces = require('os').networkInterfaces();
      info.networkInterfaces = Object.keys(interfaces).length;
    } catch (e) {
      info.networkInterfaces = 'unknown';
    }

  } catch (error) {
    log(colors.red, `Error capturing system info: ${error.message}`);
  }

  return info;
};

/**
 * Test the exact curl command that works on dev PC
 */
const testWorkingCurlCommand = async () => {
  return new Promise((resolve) => {
    log(colors.blue, "\n🧪 Testing exact working curl command...");

    const testUrl = "https://theync.com/media/videos/6/9/1/c/b/691cb2bb47ee2.mp4";
    const referer = "https://theync.com/some-page";
    const outputFile = "/tmp/capture-test.mp4";

    // This is the EXACT command that works on your dev PC
    const curlArgs = [
      "-L",
      "-v",
      "-o", outputFile,
      "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      "-H", "Accept: video/mp4,video/*,application/octet-stream,*/*;q=0.8",
      "-H", "Accept-Language: en-US,en;q=0.5",
      "-H", "Accept-Encoding: identity",
      "-H", `Referer: ${referer}`,
      testUrl
    ];

    log(colors.cyan, `Command: curl ${curlArgs.join(' ')}`);

    const curl = spawn("curl", curlArgs);
    let stderr = "";

    curl.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    curl.on("close", (code) => {
      const result = {
        exitCode: code,
        verboseOutput: stderr,
        success: false,
        fileSize: 0,
        responseCode: null,
        contentType: null,
        serverHeaders: {},
        tlsInfo: null
      };

      // Parse verbose output for details
      if (stderr) {
        // Extract HTTP response code
        const responseMatch = stderr.match(/HTTP\/[12]\.[01] (\d+)/);
        if (responseMatch) {
          result.responseCode = parseInt(responseMatch[1]);
        }

        // Extract content type
        const contentTypeMatch = stderr.match(/content-type:\s*([^\r\n]+)/i);
        if (contentTypeMatch) {
          result.contentType = contentTypeMatch[1].trim();
        }

        // Extract TLS connection info
        const tlsMatch = stderr.match(/SSL connection using\s+([^\r\n]+)/);
        if (tlsMatch) {
          result.tlsInfo = tlsMatch[1].trim();
        }

        // Extract server
        const serverMatch = stderr.match(/server:\s*([^\r\n]+)/i);
        if (serverMatch) {
          result.serverHeaders.server = serverMatch[1].trim();
        }
      }

      // Check file
      try {
        if (fs.existsSync(outputFile)) {
          const stats = fs.statSync(outputFile);
          result.fileSize = stats.size;

          if (stats.size > 0) {
            const buffer = fs.readFileSync(outputFile, { start: 0, end: 100 });
            const isVideo = buffer.includes(Buffer.from('ftyp')) && buffer.includes(Buffer.from('isom'));
            const isHtml = buffer.toString('utf8', 0, 50).includes('<!DOCTYPE');

            result.success = isVideo && !isHtml && result.responseCode === 200;
          }

          // Clean up
          fs.unlinkSync(outputFile);
        }
      } catch (e) {
        log(colors.red, `File check error: ${e.message}`);
      }

      resolve(result);
    });

    curl.on("error", (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });
  });
};

/**
 * Test various curl configurations to identify working patterns
 */
const testCurlVariations = async () => {
  const variations = [
    {
      name: "Basic",
      args: ["-L", "-v", "-o", "/tmp/var-basic.mp4", "https://theync.com/media/videos/6/9/1/c/b/691cb2bb47ee2.mp4"]
    },
    {
      name: "With User-Agent",
      args: ["-L", "-v", "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", "-o", "/tmp/var-ua.mp4", "https://theync.com/media/videos/6/9/1/c/b/691cb2bb47ee2.mp4"]
    },
    {
      name: "With Headers",
      args: ["-L", "-v", "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", "-H", "Accept: video/mp4,*/*", "-H", "Referer: https://theync.com/", "-o", "/tmp/var-headers.mp4", "https://theync.com/media/videos/6/9/1/c/b/691cb2bb47ee2.mp4"]
    },
    {
      name: "With HTTP2",
      args: ["-L", "-v", "--http2", "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", "-H", "Accept: video/mp4,*/*", "-o", "/tmp/var-http2.mp4", "https://theync.com/media/videos/6/9/1/c/b/691cb2bb47ee2.mp4"]
    },
    {
      name: "With Compression",
      args: ["-L", "-v", "--compressed", "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", "-o", "/tmp/var-compressed.mp4", "https://theync.com/media/videos/6/9/1/c/b/691cb2bb47ee2.mp4"]
    }
  ];

  const results = [];

  for (const variation of variations) {
    log(colors.blue, `\n🔄 Testing variation: ${variation.name}`);

    const result = await new Promise((resolve) => {
      const curl = spawn("curl", variation.args);
      let stderr = "";

      curl.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      curl.on("close", (code) => {
        const outputFile = variation.args.find((arg, i) => variation.args[i-1] === '-o');
        let success = false;
        let fileSize = 0;
        let responseCode = null;

        // Parse response code
        const responseMatch = stderr.match(/HTTP\/[12]\.[01] (\d+)/);
        if (responseMatch) {
          responseCode = parseInt(responseMatch[1]);
        }

        // Check file
        try {
          if (fs.existsSync(outputFile)) {
            const stats = fs.statSync(outputFile);
            fileSize = stats.size;

            if (fileSize > 0) {
              const buffer = fs.readFileSync(outputFile, { start: 0, end: 50 });
              const isVideo = buffer.includes(Buffer.from('ftyp'));
              const isHtml = buffer.toString('utf8').includes('<!DOCTYPE');
              success = isVideo && !isHtml && responseCode === 200;
            }

            fs.unlinkSync(outputFile);
          }
        } catch (e) {
          // File cleanup error, ignore
        }

        resolve({
          name: variation.name,
          exitCode: code,
          responseCode,
          fileSize,
          success,
          stderr: stderr.substring(0, 200) + '...'
        });
      });

      curl.on("error", (error) => {
        resolve({
          name: variation.name,
          error: error.message,
          success: false
        });
      });
    });

    results.push(result);

    const status = result.success ? colors.green + "✅ SUCCESS" : colors.red + "❌ FAILED";
    log(status, `${variation.name}: ${result.responseCode || 'No response'} - ${result.fileSize} bytes`);
  }

  return results;
};

/**
 * Generate a comprehensive report
 */
const generateReport = async () => {
  log(colors.bright + colors.magenta, "🔍 Dev PC Curl Behavior Capture");
  log(colors.bright + colors.magenta, "==================================");

  // System info
  log(colors.cyan, "\n📋 System Information:");
  const systemInfo = captureSystemInfo();
  Object.entries(systemInfo).forEach(([key, value]) => {
    log(colors.cyan, `  ${key}: ${value}`);
  });

  // Test exact working command
  log(colors.yellow, "\n🎯 Testing exact working command...");
  const mainResult = await testWorkingCurlCommand();

  if (mainResult.success) {
    log(colors.green, "✅ Main command successful!");
    log(colors.green, `   Response: ${mainResult.responseCode}`);
    log(colors.green, `   Content-Type: ${mainResult.contentType}`);
    log(colors.green, `   File Size: ${mainResult.fileSize} bytes`);
    log(colors.green, `   TLS: ${mainResult.tlsInfo}`);
  } else {
    log(colors.red, "❌ Main command failed!");
    if (mainResult.error) {
      log(colors.red, `   Error: ${mainResult.error}`);
    } else {
      log(colors.red, `   Response: ${mainResult.responseCode}`);
      log(colors.red, `   File Size: ${mainResult.fileSize} bytes`);
    }
  }

  // Test variations
  log(colors.yellow, "\n🔬 Testing curl variations...");
  const variations = await testCurlVariations();

  // Summary
  log(colors.bright + colors.magenta, "\n📊 Summary:");
  const successful = variations.filter(v => v.success);
  log(colors.cyan, `Working variations: ${successful.length}/${variations.length}`);

  if (successful.length > 0) {
    log(colors.green, "✅ Successful configurations:");
    successful.forEach(v => {
      log(colors.green, `   - ${v.name}: ${v.responseCode} (${v.fileSize} bytes)`);
    });
  }

  const failed = variations.filter(v => !v.success);
  if (failed.length > 0) {
    log(colors.red, "\n❌ Failed configurations:");
    failed.forEach(v => {
      log(colors.red, `   - ${v.name}: ${v.responseCode || 'Error'} (${v.fileSize} bytes)`);
    });
  }

  // Export data for server testing
  const exportData = {
    systemInfo,
    mainResult,
    variations,
    timestamp: new Date().toISOString()
  };

  const exportFile = '/tmp/curl-behavior-capture.json';
  fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2));
  log(colors.bright + colors.cyan, `\n💾 Data exported to: ${exportFile}`);
  log(colors.cyan, "Copy this file to your server and run the same script there for comparison");

  return exportData;
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateReport().catch(console.error);
}

export { generateReport as captureDevPCBehavior };
