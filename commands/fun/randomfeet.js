const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
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
        links = await scrapeLinks("https://vb2007.hu/cdn/feetpics/");

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

        var embedReplyColor;
        var embedReplyTitle;
        var embedReplyDescription;
        
        if (randomFeet == "https://vb2007.hu/cdn/feetpics/145.jpg") {
            embedReplyColor = 0xEBB22F;
            embedReplyTitle = "CONGRATULATIONS!";
            embedReplyDescription = "You found the hidden feetpic! :tada:";
        }
        else{
            embedReplyColor = 0x5F0FD6;
            embedReplyTitle = "Randomfeet.";
            embedReplyDescription = "Here is a random feetpic:";
        }

        const embedReply = new EmbedBuilder({
            color: embedReplyColor,
            title: embedReplyTitle,
            description: embedReplyDescription,
            image: {
                url: `${randomFeet}`
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}` ,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
            },
        });

        await interaction.editReply({ embeds: [embedReply] });

        //logging
        const response = JSON.stringify(embedReply.toJSON());
		await logToFileAndDatabase(interaction, response);
    }
}