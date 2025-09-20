const { SlashCommandBuilder } = require("discord.js");
const {
  embedReplyPrimaryColorImg,
  embedReplyImg,
} = require("../../helpers/embeds/embed-reply");
const fs = require("fs");
const path = require("path");
const linksFile = "./data/links.json";
const cheerio = require("cheerio");
const { logToFileAndDatabase } = require("../../helpers/logger");

async function scrapeLinks(url) {
  try {
    const response = await fetch(url, {
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
      let href = url + $(link).attr("href");

      const ext = path.extname(href);

      if (validExts.includes(ext)) {
        links.push(href);
      }
    });

    return links;
  } catch (error) {
    console.error(`Error scraping links from ${url}:`, error);
    throw error;
  }
}

async function loadLinks() {
  let links = [];

  try {
    const dataDir = "./data";
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    links = JSON.parse(fs.readFileSync(linksFile));
  } catch {
    links = await scrapeLinks("https://cdn.vb2007.hu/autoindex/feetpics/");

    fs.writeFileSync(linksFile, JSON.stringify(links));
  }

  return links;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("randomfeet")
    .setDescription("Sends a random feetpic.")
    .setNSFW(true),
  async execute(interaction) {
    //waits (and edits it's reply later) if the host is too slow
    await interaction.deferReply();

    const links = await loadLinks();

    //picks a random image from the array
    const randomFeet = links[Math.floor(Math.random() * links.length)];

    /* if (randomFeet == "https://vb2007.hu/cdn/feetpics/145.jpg") {
      var embedReply = embedReplyImg(
        0xebb22f,
        "CONGRATULATIONS!",
        "You found the hidden feetpic! :tada:",
        randomFeet,
        interaction,
      );
      } else { */
    var embedReply = embedReplyPrimaryColorImg(
      "Randomfeet.",
      "Here is a random feetpic:",
      randomFeet,
      interaction,
    );
    //}

    await interaction.editReply({ embeds: [embedReply] });
    await logToFileAndDatabase(
      interaction,
      JSON.stringify(embedReply.toJSON()),
    );
  },
};
