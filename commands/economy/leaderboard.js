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
                .setDescription("The amount of top users to display (MAX 100).")
                .setRequired(false)
        )
        .setDMPermission(false),
    async execute(interaction) {
        var amount = interaction.options.getInteger("amount") || 10;

        if(!interaction.inGuild()) {
            var replyContent = "You can only check a member's balance in a server.";
        }
        else if (amount > 100){
            var replyContent = "Cannot display more than 100 users.\nPlease try again with a smaller amount.";
        }
        else {
            var query = await db.query("SELECT userName, balance FROM economy ORDER BY balance DESC LIMIT ?", [amount]);

            var replyContent = query.map((user, index) =>
                `${index + 1}. ${user.userName} : ${user.balance}$ :moneybag:`
            ).join("\n");
        }

        var embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: `Server leaderboard: TOP ${amount} users.`,
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