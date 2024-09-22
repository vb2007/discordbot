const { SlashCommandBuilder } = require("discord.js");
const { embedReplySuccessColor, embedReplyWarningColor, embedReplyFailureColor } = require("../../helpers/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("beg")
        .setDescription("Lets you beg for a random (or no) amount of money.")
        .setDMPermission(false),
    async execute(interaction) {
        const query = await db.query("SELECT userId, lastBegTime FROM economy WHERE userId = ?", [interaction.user.id]);
        const userId = query[0]?.userId || null;
        const lastBegTime = query[0]?.lastBegTime || null;
        const nextApprovedBegTimeUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000 - 10 * 60000); //10 minutes

        const outcomeChance = Math.floor(Math.random() * 100);
        const amount = Math.floor(Math.random() * 85);

        if (userId) {
            if (!lastBegTime || lastBegTime <= nextApprovedBegTimeUTC) {
                //60% chance for getting some money
                if (outcomeChance < 60) {        
                    await db.query("UPDATE economy SET balance = balance + ?, lastBegTime = ? WHERE userId = ?",
                        [
                            amount,
                            new Date().toISOString().slice(0, 19).replace('T', ' '),
                            userId
                        ]
                    );

                    var embedReply = embedReplySuccessColor(
                        "Begging.",
                        `You've begged and some random guy gave you \`$${amount}\` dollars.`,
                        interaction
                    );
                }
                //30% chance for getting nothing
                else if (outcomeChance < 90) {
                    var embedReply = embedReplyWarningColor(
                        "Begging.",
                        `While you were begging on the street, a random guy just kicked you in the balls and left you alone with nothing.`,
                        interaction
                    );
                }
                //10% chance for loosing money
                else {
                    await db.query("UPDATE economy SET balance = balance - ?, lastBegTime = ? WHERE userId = ?",
                        [
                            amount,
                            new Date().toISOString().slice(0, 19).replace('T', ' '),
                            userId
                        ]
                    );

                    var embedReply = embedReplyFailureColor(
                        "Begging.",
                        `While you were begging near a trash can, a random guy (with a dark skin tone) took the coins from you cup, then ran away.\nYou've lost \`$${amount}\` dollars.`,
                        interaction
                    );
                }
            }
            else {
                const remainingTimeInSeconds = Math.ceil((lastBegTime.getTime() - nextApprovedBegTimeUTC.getTime()) / 1000);
                const remainingMinutes = Math.floor(remainingTimeInSeconds / 60);
                const remainingSeconds = remainingTimeInSeconds % 60;

                var embedReply = embedReplyFailureColor(
                    "Begging - Error",
                    `You've already begged in the last 10 minutes.\nPlease wait **${remainingMinutes} minute(s)** and **${remainingSeconds} second(s)** before trying to **beg** again.`,
                    interaction
                );
            }
        }
        else {
            //if it's the executor's first time using any economy command (so it's userId is not in the database yet...)
            await db.query("INSERT INTO economy (userName, userId, balance, firstTransactionDate, lastBegTime) VALUES (?, ?, ?, ?, ?)",
                [
                    interaction.user.username,
                    interaction.user.id,
                    amount,
                    new Date().toISOString().slice(0, 19).replace('T', ' '),
                    new Date().toISOString().slice(0, 19).replace('T', ' ')
                ]
            );

            var embedReply = embedSuccessColor(
                "Begging.",
                `You've begged and some random guy gave you \`$${amount}\` dollars.`,
                interaction
            );
        }

        await interaction.reply({ embeds: [embedReply] });

        //logging
        const response = JSON.stringify(embedReply.toJSON());
        await logToFileAndDatabase(interaction, response);
    }
}