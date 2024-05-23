const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { logToFileAndDatabase } = require("../../logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("randompic")
        .setDescription("Send a random picture using the picsum.photos API."),
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
        const response = `Replied with: ${embedReply.toJSON()}`;
		await logToFileAndDatabase(interaction, response);
    }
}