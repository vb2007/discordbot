const { SlashCommandBuilder } = require("discord.js");
const { embedReplyPrimaryColorWithFields, embedReplyFailureColor } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");
const translate = require('google-translate-api-x');
const fs = require('fs');
const path = require('path');

const languageCodesPath = path.join(__dirname, '../../data/language-codes.json');
const languageCodes = JSON.parse(fs.readFileSync(languageCodesPath, 'utf8'));
const supportedLanguages = languageCodes.map(lang => lang.code);
const languageMap = languageCodes.reduce((map, lang) => {
    map[lang.code] = lang.name;
    return map;
}, {});


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
                .setMinLength(2)
                .setMaxLength(2)
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName("source-language")
                .setDescription("[ISO] The language you would like to translate the message from (default: auto detect).")
                .setMinLength(2)
                .setMaxLength(2)
                .setRequired(false)
        )
        .setDMPermission(true),
    async execute(interaction) {
        const message = interaction.options.getString("message");
        const sourceLanguage = interaction.options.getString("source-language") || "auto";
        const targetLanguage = interaction.options.getString("target-language") || "en";
        console.log(message, sourceLanguage, targetLanguage);

        if (sourceLanguage !== "auto" && !supportedLanguages.includes(sourceLanguage)) {
            var embedReply = embedReplyFailureColor(
                "Translation: Error",
                `The source language code *"${sourceLanguage}"* isn't supported.\nPlease use a valid ISO language code.`,
                interaction
            );
        }
        else if (!supportedLanguages.includes(targetLanguage)) {
            var embedReply = embedReplyFailureColor(
                "Translation: Error",
                `The target language code *"${targetLanguage}"* isn't supported.\nPlease use a valid ISO language code.`,
                interaction
            );
        }
        else {
            try {
                const res = await translate(message, { from: sourceLanguage, to: targetLanguage });

                const detectedSourceLanguage = res.from.language.iso;
                const sourceLanguageName = sourceLanguage === "auto"
                    ? `${languageMap[detectedSourceLanguage]} (${detectedSourceLanguage})\n*(Auto-detected)*`
                    : `${languageMap[sourceLanguage]} (${sourceLanguage})`;
                const targetLanguageName = `${languageMap[targetLanguage]} (${targetLanguage})`;

                var embedReply = embedReplyPrimaryColorWithFields(
                    "Translation",
                    res.text,
                    [
                        { name: "Original message:", value: `*${message}*` },
                        { name: "From:", value: sourceLanguageName, inline: true },
                        { name: "To:", value: targetLanguageName, inline: true }
                    ],
                    interaction
                );
            }
            catch (error) {
                console.error(error);
                var embedReply = embedReplyFailureColor(
                    "Translation: Error",
                    `An error occurred while translating the message. Please try again later.`,
                    interaction
                );
            }
        }

        await interaction.reply({ embeds: [embedReply] });

        //logging
        const response = JSON.stringify(embedReply.toJSON());
        await logToFileAndDatabase(interaction, response);
    }
}