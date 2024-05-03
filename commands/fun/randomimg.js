const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("randompic")
        .setDescription("Send a random image using the picsum.photos API."),
    async execute(interaction) {
        // There are currently 1084 photos on picsum.images
        // And we need an ID to keep a requested image
        const randomImageId = (Math.floor(Math.random() * 1085));

        const embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: "Random pic.",
            description: "Here is a random 512x512 image from picsum.photos (might take some time to load):",
            image: {
                url: `https://picsum.photos/id/${randomImageId}/512/512`
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}` ,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
            },
        });

        await interaction.reply({ embeds: [embedReply] });

        //logging
        const logMessage =
            `Command: ${interaction.commandName}\n` +
            `Executer: ${interaction.user.tag} (ID: ${interaction.user.id})\n` +
            `Server: ${interaction.inGuild() ? `${interaction.guild.name} (ID: ${interaction.guild.id})` : "Not in a server." }\n` +
            `Time: ${new Date(interaction.createdTimestamp).toLocaleString()}\n\n`

        //console.log(logMessage);

        fs.appendFile("log/command-randomimg.log", logMessage, (err) => {
            if (err) {
                console.error("Error while writing the logs: ", err);
            }
        });
    }
}