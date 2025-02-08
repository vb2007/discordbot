const { SlashCommandBuilder } = require("discord.js");
const { embedReplySuccessColor, embedReplyFailureColor } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("coinflip")
        .setDescription("Let's you bet a specified amout of money on heads or tais.")
        .addStringOption(option =>
            option
                .setName("side")
                .setDescription("The side of the coin you would like to place your bet on.")
                .addChoices(
                    { name: "Head", value: "head" },
                    { name: "Tails", value: "tails" }
                )
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("The amount of money you would like to play with.")
                .setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            var embedReply = embedReplyFailureColor(
                "Coinflip - Error",
                "You can only play coinflip in a server.",
                interaction
            );
        }
        else {
            const interactionUserId = interaction.user.id;
            const amount = interaction.options.getInteger("amount");

            const query = await db.query("SELECT balance, lastCoinflipTime FROM economy WHERE userId = ?", [interactionUserId]);
            const userBalance = Number(query[0]?.balance);

            const lastCoinflipTime = query[0]?.lastCoinflipTime;
            const nextApprovedCoinflipTimeUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000 - 3 * 60000); //3 minutes

            if(lastCoinflipTime >= nextApprovedCoinflipTimeUTC) {
                const remainingTimeInSeconds = Math.ceil((lastCoinflipTime.getTime() - nextApprovedCoinflipTimeUTC.getTime()) / 1000);
                const remainingMinutes = Math.floor(remainingTimeInSeconds / 60);
                const remainingSeconds = remainingTimeInSeconds % 60;

                var embedReply = embedReplyFailureColor(
                    "Coinflip - Error",
                    `You've already played coinflip in the last 3 minutes.\nPlease wait **${remainingMinutes} minute(s)** and **${remainingSeconds} second(s)** before trying to **play coinflip** again.`,
                    interaction
                );
            }
            else if (userBalance < amount) {
                var embedReply = embedReplyFailureColor(
                    "Coinflip - Error",
                    `You can't play with that much money!\nYour current balance is only \`$${userBalance}\`.`,
                    interaction
                );
            }
            else if (amount <= 0) {
                var embedReply = embedReplyFailureColor(
                    "Coinflip - Error",
                    `You can't play without money.\nPlease enter a positive amount that's in you balance range.\nYour current balance is \`$${userBalance}\`.`,
                    interaction
                );
            }
            else {
                const userBet = interaction.options.getString("side");
                const flip = Math.random() < 0.5 ? "tails" : "head";
                const won = userBet === flip;

                if (won) {
                    await db.query("UPDATE economy SET balance = balance + ?, lastCoinflipTime = ? WHERE userId = ?",
                        [
                            amount,
                            new Date().toISOString().slice(0, 19).replace('T', ' '),
                            interactionUserId
                        ]
                    );

                    var embedReply = embedReplySuccessColor(
                        "Coinflip - Won",
                        `The coin landed on **${flip}**, matching your bet.\nYou won \`$${amount}\`!\nYour new balance is \`$${userBalance + amount}\`.`,
                        interaction
                    );
                }
                else {
                    await db.query("UPDATE economy SET balance = balance - ?, lastCoinflipTime = ? WHERE userId = ?",
                        [
                            amount,
                            new Date().toISOString().slice(0, 19).replace('T', ' '),
                            interactionUserId
                        ]
                    );

                    var embedReply = embedReplyFailureColor(
                        "Coinflip - Lost",
                        `The coin landed on **${flip}**, not matching your bet.\nYou've lost \`$${amount}\`!\nYour new balance is \`$${userBalance - amount}\`.`,
                        interaction
                    );
                }
            }
        }

        await interaction.reply({ embeds: [embedReply] })
        await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
    }
}