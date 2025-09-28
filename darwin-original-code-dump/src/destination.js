const http = require("http");
const https = require("https");

function destination(url) {
  return new Promise((resolve, reject) => {
    let client = url.startsWith("https") ? https : http;

    client
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          resolve(getFinalUrl(res.headers.location));
        } else {
          resolve(url);
        }
      })
      .on("error", reject);
  });
}

module.exports = {
  destination,
};
