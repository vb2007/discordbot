const { SlashCommandBuilder } = require('discord.js');
const { embedReplyPrimaryColorWithFields } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Displays the discord API's current latency."),
    async execute(interaction) {

        const embedReply = embedReplyPrimaryColorWithFields(
            "Ping.",
            "",
            [
                { name: "Pong! :ping_pong:", value: ""},
                { name: "Response time: ", value: `${Date.now() - interaction.createdTimestamp}ms`, inline: true }
            ],
            interaction
        );
        
        await interaction.reply({ embeds: [embedReply] });
        await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
    }
}