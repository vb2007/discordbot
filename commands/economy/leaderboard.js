const { SlashCommandBuilder } = require("discord.js");
const { embedReplyPrimaryColor, embedReplyFailureColor } = require("../../helpers/embed-reply");
const db = require("../../helpers/db");
const { logToFileAndDatabase } = require("../../helpers/logger");

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
            var embedReply = embedReplyFailureColor(
                "Leaderboard - Error",
                "You can only check a member's balance in a server.",
                interaction
            );
        }
        else if (amount > 100){
            var embedReply =  embedReplyFailureColor(
                "Leaderboard - Error",
                "Cannot display more than 100 users.\nPlease try again with a smaller amount.",
                interaction
            );
        }
        else {
            var query = await db.query("SELECT userId, balance FROM economy ORDER BY balance DESC LIMIT ?", [amount]);

            var actualUserAmount = query.length;

            var replyContent = query.map((user, index) =>
                `**${index + 1}**. <@${user.userId}> : \`$${user.balance}\` :moneybag:`
            ).join('\n');

            var query = await db.query("SELECT COUNT(*) FROM economy");
            var totalUserAmount = query[0]["COUNT(*)"];

            var replyContent = replyContent + `\n\nEnd of the leaderboard. :eyes:\nThis server has **${totalUserAmount}** user${totalUserAmount !== 1 ? 's' : ''} with a balance.`;

            if (actualUserAmount == 0) {
                var embedReply = embedReplyFailureColor(
                    "Empty leaderboard.",
                    "There are no users with a balance on this server.\nUse the `/work` command to be the first one on this list! :grin:",
                    interaction
                );
            }
            else {
                var embedReply = embedReplyPrimaryColor(
                    `Server leaderboard: TOP ${actualUserAmount} user${actualUserAmount !== 1 ? 's' : ''}.`,
                    replyContent,
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