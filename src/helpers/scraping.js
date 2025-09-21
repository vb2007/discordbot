import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";

const scrapeImages = async (sourceUrl) => {
  try {
    const response = await fetch(sourceUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const validExts = [".webp", ".jpg", ".jpeg", ".png"];
    const links = [];

    $("a").each((i, link) => {
      let href = sourceUrl + $(link).attr("href");

      const ext = path.extname(href);

      if (validExts.includes(ext)) {
        links.push(href);
      }
    });

    return links;
  } catch (error) {
    console.error("Error scraping images:", error);
    return [];
  }
};

export const loadLinks = async (linksFileName, sourceUrl) => {
  const linksFile = "./src/data/" + linksFileName;
  let links = [];

  try {
    const dataDir = "./src/data/";
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    links = JSON.parse(fs.readFileSync(linksFile));
  } catch {
    links = await scrapeImages(sourceUrl);

    fs.writeFileSync(linksFile, JSON.stringify(links));
  }

  return links;
};
