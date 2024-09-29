const { SlashCommandBuilder } = require("discord.js");
const { embedReplyPrimaryColor } = require("../../helpers/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

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


        await interaction.reply({ embeds: [embedReply] });
        
        //logging
        const response = JSON.stringify(embedReply.toJSON());
		await logToFileAndDatabase(interaction, response);
    }
}