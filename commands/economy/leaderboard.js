const { SlashCommandBuilder } = require("discord.js");
const { embedReplyPrimaryColor, embedReplyFailureColor } = require("../../helpers/embeds/embed-reply");
const db = require("../../helpers/db");
const { logToFileAndDatabase } = require("../../helpers/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Check the users with the most money on the server.")
        .addStringOption(option =>
            option
                .setName("type")
                .setDescription("The type of leaderboard (cash / bank) you want to see.")
                .addChoices(
                    { name: "Cash (default option)", value: "cash" },
                    { name: "Bank", value: "bank" }
                )
                .setRequired(false))
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("The amount of top users to display (MAX 100).")
                .setRequired(false))
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
            const type = interaction.options.getString("type") || "cash";
            const members = await interaction.guild.members.fetch();
            const memberIds = members.map(member => member.id);

            switch (type) {
                case "cash":
                    var query = await db.query("SELECT userId, balance FROM economy WHERE userId IN (?) AND balance > 0 ORDER BY balance DESC LIMIT ?", [memberIds, amount]);

                    var actualUserAmount = query.length;

                    var replyContent = query.map((user, index) =>
                        `**${index + 1}**. <@${user.userId}> : \`$${user.balance}\` :moneybag:`
                    ).join('\n');

                    var query = await db.query("SELECT COUNT(*) FROM economy WHERE userId IN (?) AND balance > 0", [memberIds]);
                    var totalUserAmount = Number(query[0]["COUNT(*)"]);

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

                    break;
                case "bank":
                    var query = await db.query("SELECT userId, balanceInBank FROM economy WHERE userId IN (?) AND balanceInBank > 0 ORDER BY balanceInBank DESC LIMIT ?", [memberIds, amount]);

                    var actualUserAmount = query.length;

                    var replyContent = query.map((user, index) =>
                        `**${index + 1}**. <@${user.userId}> : \`$${user.balanceInBank}\` :bank:`
                    ).join('\n');

                    var query = await db.query("SELECT COUNT(*) FROM economy WHERE userId IN (?) AND balanceInBank > 0", [memberIds]);
                    var totalUserAmount = Number(query[0]["COUNT(*)"]);

                    var replyContent = replyContent + `\n\nEnd of the leaderboard. :eyes:\nThis server has **${totalUserAmount}** user${totalUserAmount !== 1 ? 's' : ''} with a balance in the bank.`;

                    if (actualUserAmount == 0) {
                        var embedReply = embedReplyFailureColor(
                            "Empty bank leaderboard.",
                            "There are no users with a balance in their bank on this server.\nIf you have some money, use the `/deposit` command to be the first one on this list! :grin:\nIf you don't, try using the `/work` command to earn some money! :thumbsup:",
                            interaction
                        );
                    }
                    else {
                        var embedReply = embedReplyPrimaryColor(
                            `Server bank leaderboard: TOP ${actualUserAmount} user${actualUserAmount !== 1 ? 's' : ''}.`,
                            replyContent,
                            interaction
                        );
                    }

                    break;
                default:
                    var embedReply = embedReplyFailureColor(
                        "Leaderboard - Error",
                        "Invalid leaderboard type provided as command option parameter.\nPlease choose either `cash` or `bank`.",
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