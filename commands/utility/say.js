const { SlashCommandBuilder } = require("discord.js");
const { embedReplySaidByPrimaryColor } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("say")
        .setDescription("Makes the bot say something.")
        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("The message the bot will say.")
                .setRequired(true))
        .setDMPermission(true),
    async execute(interaction) {
        const message = interaction.options.getString("message");

        var embedReply = embedReplySaidByPrimaryColor(
            "The bot said:",
            `*${message}*`,
            interaction
        );

        await interaction.reply({ embeds: [embedReply] });
        
        //logging
        const response = JSON.stringify(embedReply.toJSON());
		await logToFileAndDatabase(interaction, response);
    }
}