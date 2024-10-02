const { SlashCommandBuilder } = require("discord.js");
const { embedReplyPrimaryColor, embedReplyFailureColor } = require("../../helpers/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");
const translate = require('google-translate-api-x');
const fs = require('fs');
const path = require('path');

const languageCodesPath = path.join(__dirname, '../../data/language-codes.json');
const languageCodes = JSON.parse(fs.readFileSync(languageCodesPath, 'utf8'));
const supportedLanguages = languageCodes.map(lang => lang.code);

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
                .setDescription("[ISO] The language you would like to translate the message to (default: English).")
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName("source-language")
                .setDescription("[ISO] The language you would like to translate the message from (default: auto detect).")
                .setRequired(false)
        )
        .setDMPermission(true),
    async execute(interaction) {
        const message = interaction.options.getString("message");
        const sourceLanguage = interaction.options.getString("source-language") || "auto";
        const targetLanguage = interaction.options.getString("target-language") || "en";
        console.log(message, sourceLanguage, targetLanguage);
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