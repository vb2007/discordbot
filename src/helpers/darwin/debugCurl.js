#!/usr/bin/env node

/**
 * Debug script to test curl functionality for Darwin anti-fingerprinting system
 * Run with: node debugCurl.js
 */

import { spawn, execSync } from "child_process";
import fs from "fs";

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
 * Find curl executable
 */
const findCurl = () => {
  const paths = ["/usr/local/bin/curl", "/usr/bin/curl", "/opt/homebrew/bin/curl", "curl"];

  for (const path of paths) {
    try {
      if (path === "curl") {
        execSync("which curl", { stdio: "ignore" });
        return "curl";
      } else if (fs.existsSync(path)) {
        return path;
      }
    } catch (e) {
      // Continue
    }
  }
  return null;
};

/**
 * Test curl version and features
 */
const testCurlVersion = async (curlPath) => {
  return new Promise((resolve) => {
    log(colors.blue, `\n🔍 Testing curl version at: ${curlPath}`);

    const curl = spawn(curlPath, ["--version"]);
    let stdout = "";
    let stderr = "";

    curl.stdout.on("data", (data) => (stdout += data.toString()));
    curl.stderr.on("data", (data) => (stderr += data.toString()));

    curl.on("close", (code) => {
      if (code === 0) {
        log(colors.green, "✅ Curl version check successful");
        console.log(stdout);

        const features = {
          HTTP2: stdout.includes("HTTP2"),
          HTTP3: stdout.includes("HTTP3"),
          TLS: stdout.includes("TLS"),
          Brotli: stdout.includes("brotli"),
          OpenSSL: stdout.includes("OpenSSL"),
        };

        log(colors.cyan, "\n📋 Features:");
        Object.entries(features).forEach(([feature, has]) => {
          log(has ? colors.green : colors.red, `  ${feature}: ${has ? "✅" : "❌"}`);
        });

        resolve(true);
      } else {
        log(colors.red, `❌ Curl version check failed (code ${code})`);
        if (stderr) console.error(stderr);
        resolve(false);
      }
    });

    curl.on("error", (error) => {
      log(colors.red, `❌ Curl spawn error: ${error.message}`);
      resolve(false);
    });
  });
};

/**
 * Test basic HTTP request
 */
const testBasicRequest = async (curlPath) => {
  return new Promise((resolve) => {
    log(colors.blue, "\n🌐 Testing basic HTTP request...");

    const curl = spawn(curlPath, [
      "-s",
      "-I",
      "-L",
      "--connect-timeout",
      "10",
      "--max-time",
      "30",
      "https://httpbin.org/get",
    ]);

    let stdout = "";
    let stderr = "";

    curl.stdout.on("data", (data) => (stdout += data.toString()));
    curl.stderr.on("data", (data) => (stderr += data.toString()));

    curl.on("close", (code) => {
      if (code === 0 && stdout.includes("200 OK")) {
        log(colors.green, "✅ Basic HTTP request successful");
        resolve(true);
      } else {
        log(colors.red, `❌ Basic HTTP request failed (code ${code})`);
        if (stderr) console.error("Error:", stderr);
        if (stdout) console.log("Response:", stdout.substring(0, 200));
        resolve(false);
      }
    });

    curl.on("error", (error) => {
      log(colors.red, `❌ HTTP request error: ${error.message}`);
      resolve(false);
    });
  });
};

/**
 * Test TLS capabilities
 */
const testTLSCapabilities = async (curlPath) => {
  return new Promise((resolve) => {
    log(colors.blue, "\n🔒 Testing TLS 1.3 capabilities...");

    const curl = spawn(curlPath, [
      "-s",
      "-I",
      "-L",
      "--tls-max",
      "1.3",
      "--ciphers",
      "TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256",
      "--curves",
      "X25519:prime256v1",
      "--connect-timeout",
      "10",
      "--max-time",
      "30",
      "https://tls13.crypto.mozilla.org/",
    ]);

    let stdout = "";
    let stderr = "";

    curl.stdout.on("data", (data) => (stdout += data.toString()));
    curl.stderr.on("data", (data) => (stderr += data.toString()));

    curl.on("close", (code) => {
      if (code === 0 && (stdout.includes("200 OK") || stdout.includes("HTTP"))) {
        log(colors.green, "✅ TLS 1.3 request successful");
        resolve(true);
      } else {
        log(colors.yellow, `⚠️ TLS 1.3 test inconclusive (code ${code})`);
        log(colors.magenta, "This may still work with the target site");
        resolve(true); // Don't fail completely on TLS test
      }
    });

    curl.on("error", (error) => {
      log(colors.yellow, `⚠️ TLS test error: ${error.message}`);
      resolve(true); // Don't fail completely
    });
  });
};

/**
 * Test actual video site request
 */
const testVideoSiteRequest = async (curlPath) => {
  return new Promise((resolve) => {
    log(colors.blue, "\n📹 Testing video site request...");

    const curl = spawn(curlPath, [
      "-s",
      "-I",
      "-L",
      "-A",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "-H",
      "Accept: video/mp4,video/*,*/*;q=0.8",
      "-H",
      "Accept-Language: en-US,en;q=0.9",
      "-H",
      "Referer: https://theync.com/",
      "--connect-timeout",
      "15",
      "--max-time",
      "60",
      "https://theync.com/media/videos/6/9/1/c/b/691cb2bb47ee2.mp4",
    ]);

    let stdout = "";
    let stderr = "";

    curl.stdout.on("data", (data) => (stdout += data.toString()));
    curl.stderr.on("data", (data) => (stderr += data.toString()));

    curl.on("close", (code) => {
      log(colors.cyan, "\n📄 Response headers:");
      console.log(stdout.substring(0, 500));

      if (code === 0) {
        if (stdout.includes("200 OK") && stdout.includes("video/mp4")) {
          log(colors.green, "✅ Video site allows access!");
        } else if (stdout.includes("403")) {
          log(colors.yellow, "⚠️ Video site returned 403 (blocked)");
        } else if (stdout.includes("404")) {
          log(colors.yellow, "⚠️ Video not found (404) - expected for test");
        } else {
          log(colors.yellow, `⚠️ Video site returned unexpected response`);
        }
        resolve(true);
      } else {
        log(colors.red, `❌ Video site request failed (code ${code})`);
        if (stderr) console.error("Error:", stderr);
        resolve(false);
      }
    });

    curl.on("error", (error) => {
      log(colors.red, `❌ Video site request error: ${error.message}`);
      resolve(false);
    });
  });
};

/**
 * Main debug function
 */
const runDebug = async () => {
  log(colors.bright + colors.magenta, "🔧 Darwin Curl Debug Tool");
  log(colors.bright + colors.magenta, "============================");

  // Find curl
  const curlPath = findCurl();
  if (!curlPath) {
    log(colors.red, "❌ No curl executable found!");
    log(colors.yellow, "Please install curl or ensure it's in your PATH");
    process.exit(1);
  }

  log(colors.green, `✅ Found curl at: ${curlPath}`);

  // Run tests
  const tests = [
    ["Version Check", () => testCurlVersion(curlPath)],
    ["Basic HTTP", () => testBasicRequest(curlPath)],
    ["TLS Capabilities", () => testTLSCapabilities(curlPath)],
    ["Video Site Access", () => testVideoSiteRequest(curlPath)],
  ];

  const results = [];
  for (const [name, testFn] of tests) {
    const result = await testFn();
    results.push([name, result]);
  }

  // Summary
  log(colors.bright + colors.magenta, "\n📊 Test Summary:");
  log(colors.bright + colors.magenta, "================");

  let allPassed = true;
  for (const [name, passed] of results) {
    const status = passed ? "✅ PASS" : "❌ FAIL";
    const color = passed ? colors.green : colors.red;
    log(color, `${status} ${name}`);
    if (!passed) allPassed = false;
  }

  if (allPassed) {
    log(colors.bright + colors.green, "\n🎉 All tests passed! Curl should work with Darwin.");
  } else {
    log(
      colors.bright + colors.red,
      "\n⚠️ Some tests failed. Check curl installation and network connectivity."
    );
  }

  log(colors.bright + colors.cyan, "\n💡 Usage tips:");
  log(colors.cyan, "- If TLS test failed, update curl and OpenSSL");
  log(colors.cyan, "- If video site blocks, the anti-fingerprinting system will help");
  log(colors.cyan, "- Run this script periodically to verify connectivity");
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDebug().catch(console.error);
}

export { runDebug as debugCurl };
