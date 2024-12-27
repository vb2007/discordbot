const { SlashCommandBuilder } = require("discord.js");
const { embedReplySuccessColor, embedReplyFailureColor, embedReplyWarningColor } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("blackjack")
        .setDescription("Play a game of blackjack.")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("The amount of money you would like to play with.")
                .setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            var embedReply = embedReplyFailureColor(
                "Roulette - Error",
                "You can only play roulette in a server.",
                interaction
            );
        }
        else {
            const interactionUserId = interaction.user.id;
            const amount = interaction.options.getInteger("amount");

            const query = await db.query("SELECT balance, lastBlackjackTime FROM economy WHERE userId = ?", [interactionUserId]);
            const userBalance = query[0]?.balance;

            const lastBlackjackTime = query[0]?.lastBlackjackTime;
            const nextApprovedBlackjackTimeUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000 - 8 * 60000); //8 minutes

            if (lastBlackjackTime >= nextApprovedBlackjackTimeUTC) {
                const remainingTimeInSeconds = Math.ceil((lastBlackjackTime.getTime() - nextApprovedBlackjackTimeUTC.getTime()) / 1000);
                const remainingMinutes = Math.floor(remainingTimeInSeconds / 60);
                const remainingSeconds = remainingTimeInSeconds % 60;

                var embedReply = embedReplyFailureColor(
                    "Blackjack - Error",
                    `You've already played blackjack in the last 8 minutes.\nPlease wait **${remainingMinutes} minute(s)** and **${remainingSeconds} second(s)** before trying to **play blackjack** again.`,
                    interaction
                );
            }
            else if (userBalance < amount) {
                var embedReply = embedReplyFailureColor(
                    "Roulette - Error",
                    `You can't play with that much money!\nYour current balance is only \`$${userBalance}\`.`,
                    interaction
                );
            }
            else if (amount <= 0) {
                var embedReply = embedReplyFailureColor(
                    "Blackjack - Error",
                    "You can't play without money.\nPlease enter a positive amount that's in you balance range.\nYour current balance is \`$${userBalance}\`.",
                    interaction
                );
            }
            else {

            }
        }

        await interaction.reply({ embeds: [embedReply] });
        await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
    }
}