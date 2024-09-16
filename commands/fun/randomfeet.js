const { SlashCommandBuilder } = require("discord.js");
const { embedReplyPrimaryColorImg, embedReplyImg } = require("../../helpers/embed-reply");
const fs = require("fs");
const path = require("path");
const linksFile = "./data/links.json"; 
const request = require("request-promise");
const cheerio = require("cheerio");
const { logToFileAndDatabase } = require("../../helpers/logger");

async function scrapeLinks(url) {
    const res = await request(url);
    const $ = cheerio.load(res);

    const validExts = [".webp", ".jpg", ".jpeg", ".png"];
    const links = [];

    $('a').each((i, link) => {
        let href = (url + $(link).attr("href"));

        const ext = path.extname(href);

        if(validExts.includes(ext)) {
            links.push(href);
        }
    });
    
    return links;
}

async function loadLinks() {
    let links = [];
    
    try {
        const dataDir = ("./data");
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }

        links = JSON.parse(fs.readFileSync(linksFile));
    }
    catch {
        links = await scrapeLinks("https://cdn.vb2007.hu/autoindex/feetpics/");

        await fs.writeFileSync(linksFile, JSON.stringify(links));
    }

    return links;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("randomfeet")
        .setDescription("Sends a random feetpic."),
    async execute(interaction) {
        //waits (and edits it's reply later) if the host is too slow
        await interaction.deferReply();

        const links = await loadLinks();

        //random képet választ a listából
        const randomFeet = links[Math.floor(Math.random() * links.length)];
        
        if (randomFeet == "https://vb2007.hu/cdn/feetpics/145.jpg") {
            var embedReply = embedReplyImg(
                0xEBB22F,
                "CONGRATULATIONS!",
                "You found the hidden feetpic! :tada:",
                randomFeet,
                interaction
            );
        }
        else{
            var embedReply = embedReplyPrimaryColorImg(
                "Randomfeet.",
                "Here is a random feetpic:",
                randomFeet,
                interaction
            );
        }

        await interaction.editReply({ embeds: [embedReply] });

        //logging
        const response = JSON.stringify(embedReply.toJSON());
		await logToFileAndDatabase(interaction, response);
    }
}