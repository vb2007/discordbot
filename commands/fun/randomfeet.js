const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const linksFile = './data/links.json'; 
const request = require('request-promise');
const cheerio = require('cheerio');

async function scrapeLinks(url) {
    const res = await request(url);
    const $ = cheerio.load(res);

    const validExts = [".webp", ".jpg", ".jpeg", ".png"];
    const links = [];

    $('a').each((i, link) => {
        let href = (url + $(link).attr('href'));

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
        links = JSON.parse(fs.readFileSync(linksFile));
    }
    catch {
        links = await scrapeLinks("https://vb2007.hu/extended-cdn/feetpics/");

        await fs.writeFileSync(linksFile, JSON.stringify(links));
    }

    return links;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("randomfeet")
        .setDescription("Sends a random feetpic."),
    async execute(interaction) {
        //vár ha egyszerre túl sok a lábkép kérelem...
        await interaction.deferReply();

        // const feetpics = [
        //     "https://vb2007.hu/extended-cdn/feetpics/special/bsmaci1.jpg",
        //     "https://vb2007.hu/extended-cdn/feetpics/special/forgacs.webp",
        //     "https://vb2007.hu/extended-cdn/feetpics/special/py1.png",
        //     "https://vb2007.hu/extended-cdn/feetpics/special/py2.webp",
        //     "https://vb2007.hu/extended-cdn/feetpics/special/py3.webp",
        //     "https://vb2007.hu/extended-cdn/feetpics/special/py4.webp",
        //     "https://vb2007.hu/extended-cdn/feetpics/special/py5.webp",
        //     "https://vb2007.hu/extended-cdn/feetpics/special/skelly1.jpg",
        //     "https://vb2007.hu/extended-cdn/feetpics/special/skelly2.jpg",
        //     "https://vb2007.hu/extended-cdn/feetpics/special/skelly3.jpg",
        //     "https://vb2007.hu/extended-cdn/feetpics/special/skelly4.jpg",
        //     "https://vb2007.hu/extended-cdn/feetpics/special/tea1.jpg",
        //     "https://vb2007.hu/extended-cdn/feetpics/special/tea2.jpg",
        //     "https://vb2007.hu/extended-cdn/feetpics/special/tea3.jpg",
        //     "https://vb2007.hu/extended-cdn/feetpics/special/tea4.jpg",
        //     "https://vb2007.hu/extended-cdn/feetpics/special/umberto.webp",
        // ]

        const links = await loadLinks();

        //random képet választ a listából
        const randomFeet = links[Math.floor(Math.random() * links.length)];

        var embedReplyColor;
        var embedReplyTitle;
        var embedReplyDescription;
        
        if (randomFeet == "https://vb2007.hu/extended-cdn/feetpics/145.jpg") {
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

        //logol
        const logMessage =
            `Command: ${interaction.commandName}\n` +
            `User: ${interaction.user.tag} (ID: ${interaction.user.id})\n` +
            `Server: ${interaction.guild.name || "Not in server"} (ID: ${interaction.guild.id || "-"})\n` +
            `Time: ${new Date(interaction.createdTimestamp).toLocaleString()}\n` +
            `Response: Sent ${randomFeet}\n\n`;

        //console.log(logMessage);

        fs.appendFile("log/command-randomfeet.log", logMessage, (err) => {
            if (err) {
                console.error("Error while writing the logs: ", err);
            }
        });
    }
}