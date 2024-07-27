const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const db = require("../../db");
const { logToFileAndDatabase } = require("../../logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Check the users with the most money on the server.")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("The amount of top users to display.")
                .setRequired(false)
        )
        .setDMPermission(false),
    async execute(interaction) {
        if(!interaction.inGuild()) {
            var replyContent = "You can only check a member's balance in a server.";
        }
        else {
            
            var embedReply = new EmbedBuilder({
                color: 0x5F0FD6,
                title: "Server leaderboard.",
                description: replyContent,
                timestamp: new Date().toISOString(),
                footer: {
                    text: `Requested by: ${interaction.user.username}`,
                    icon_url: interaction.user.displayAvatarURL({ dynamic: true })
                }
            });

            await interaction.reply({ embeds: [embedReply] });

            //logging
            const response = JSON.stringify(embedReply.toJSON());
            await logToFileAndDatabase(interaction, response);
        }
    }
}