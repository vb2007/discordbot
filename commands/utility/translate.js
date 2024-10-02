const { SlashCommandBuilder } = require("discord.js");
const { embedReplyPrimaryColor, embedReplyFailureColor } = require("../../helpers/embed-reply");
const db = require("../../helpers/db");
const { logToFileAndDatabase } = require("../../helpers/logger");
const translate = require("google-translate-api");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("translate")
        .setDescription("Translates a message to a specified language.")
        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("The text you would like to translate.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("target-language")
                .setDescription("The language you would like to translate the message to (default: English).")
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName("source-language")
                .setDescription("The language you would like to translate the message from (default: auto detect).")
                .setRequired(false)
        )
        .setDMPermission(true),
    async execute(interaction) {
        const message = interaction.options.getString("message");
        const sourceLanguage = interaction.options.getString("source-language") || "auto";
        const targetLanguage = interaction.options.getString("target-language") || "en";

        try {
            const res = await translate(message, { from: sourceLanguage, to: targetLanguage });

            var embedReply = embedReplyPrimaryColor(
                "Translation",
                res.text,
                interaction
            );
        }
        catch (error) {
            console.error(error);
            var embedReply = embedReplyFailureColor(
                "Translation",
                `An error occurred while translating the message. Please try again later.`,
                interaction
            );
        }

        await interaction.reply({ embeds: [embedReply] });

        //logging
        const response = JSON.stringify(embedReply.toJSON());
        await logToFileAndDatabase(interaction, response);
    }
}