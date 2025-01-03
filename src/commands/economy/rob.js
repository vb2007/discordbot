const { SlashCommandBuilder } = require("discord.js");
const { embedReplyFailureColor, embedReplySuccessColor } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rob")
        .setDescription("Tries to rob a random amount of money from a specified user.")
        .addUserOption(option =>
            option
                .setName("target")
                .setDescription("Choose the target you want to rob from.")
                .setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            var embedReply = embedReplyFailureColor(
                "Robbing - Error",
                "You can only rob from a member in a server.",
                interaction
            );
        }
        else {
            const query = await db.query("SELECT userId, lastRobTime FROM economy WHERE userId = ?", [interaction.user.id]);
            const userId = query[0]?.userId || null;
            const lastRobTime = query[0]?.lastRobTime || null;
            const nextApprovedRobTimeUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000 - 30 * 60000); //30 minutes

            const targetUserId = interaction.options.getUser("target").id;

            if (targetUserId == interaction.user.id) {
                var embedReply = embedReplyFailureColor(
                    "Robbing - Error",
                    "Why are you trying to rob from yourself? :clown:\n**TIP:** If you're having trouble finding a target, try using the \`/leaderboard\` command.",
                    interaction
                );
            }
            else {
                if (!lastRobTime || lastRobTime <= nextApprovedRobTimeUTC) {
                    const query = await db.query("SELECT balance FROM economy WHERE userId = ?", [targetUserId]);
                    const targetUserBalance = query[0]?.balance || null;

                    //if target user's balance is above 50...
                    if (targetUserBalance > 50) {
                        const robAmount = Math.floor(Math.random() * 50);

                        //removes the robbed amount from the target user
                        await db.query("UPDATE economy SET balance = balance - ? WHERE userId = ?",
                            [
                                robAmount,
                                targetUserId
                            ]
                        );

                        if(userId) {
                            //adds the robbed amount to the interaction's executor
                            await db.query("UPDATE economy SET balance = balance + ?, lastRobTime = ? WHERE userId = ?",
                                [
                                    robAmount,
                                    new Date().toISOString().slice(0, 19).replace('T', ' '),
                                    interaction.user.id
                                ]
                            );
                        }
                        //if it's the executor's first time using any economy command (so it's userId is not in the database yet...)
                        else {
                            await db.query("INSERT INTO economy (userName, userId, balance, firstTransactionDate, lastRobTime) VALUES (?, ?, ?, ?, ?)",
                                [
                                    interaction.user.username,
                                    interaction.user.id,
                                    robAmount,
                                    new Date().toISOString().slice(0, 19).replace('T', ' '),
                                    new Date().toISOString().slice(0, 19).replace('T', ' ')
                                ]
                            );
                        }

                        var embedReply = embedReplySuccessColor(
                            "Robbing successful",
                            `<@${interaction.user.id}> has successfully robbed \`$${robAmount}\` from <@${targetUserId}>.`,
                            interaction
                        );
                    }
                    else {
                        var embedReply = embedReplyFailureColor(
                            "Robbing - Error",
                            `Your target (<@${targetUserId}>) must have a minimum of \`$50\`.\nPlease choose another target.\n**TIP:** You can check how much money the top memebers have with the \`/leaderboard\` command.`,
                            interaction
                        );
                    }
                }
                else {
                    const remainingTimeInSeconds = Math.ceil((lastRobTime.getTime() - nextApprovedRobTimeUTC.getTime()) / 1000);
                    const remainingMinutes = Math.floor(remainingTimeInSeconds / 60);
                    const remainingSeconds = remainingTimeInSeconds % 60;

                    var embedReply = embedReplyFailureColor(
                        "Robbing - Error",
                        `You've already robbed in the last 30 minutes.\nPlease wait **${remainingMinutes} minute(s)** and **${remainingSeconds} second(s)** before trying to **rob** again.`,
                        interaction
                    );
                }
            }
        }

        await interaction.reply({ embeds: [embedReply] });
        await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
    }
}