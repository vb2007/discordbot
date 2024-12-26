const { SlashCommandBuilder } = require('discord.js');
const { embedReplyPrimaryColorImg } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("randompic")
        .setDescription("Send a random picture using the picsum.photos API."),
    async execute(interaction) {
        // There are currently 1084 photos on picsum.images
        // And we need an ID to remember the specific image
        const randomImageId = (Math.floor(Math.random() * 1085));

        const embedReply = embedReplyPrimaryColorImg(
            "Random pic.",
            "Here is a random 512x512 image from picsum.photos (might take some time to load):",
            `https://picsum.photos/id/${randomImageId}/512/512`,
            interaction
        );

        await interaction.reply({ embeds: [embedReply] });
        await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
    }
}