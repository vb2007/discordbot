const { SlashCommandBuilder } = require("discord.js");
const { embedReplySuccessColor, embedReplyFailureColor, embedReplyWarningColor } = require("../../helpers/embeds/embed-reply");
const checkCooldown = require("../../helpers/economy");
const { logToFileAndDatabase } = require("../../helpers/logger");
const format = require("../../helpers/format");
const generate = require("../../helpers/generate");
const db = require("../../helpers/db");

const commandName = "roulette";

module.exports = {
    data: new SlashCommandBuilder()
        .setName(commandName)
        .setDescription("Try your luck and play a game of roulette.")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("The amount of money you would like to play with.")
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName("color")
                .setDescription("The color you would like to to bet on.")
                .addChoices(
                    { name: "Red", value: "red" },
                    { name: "Black", value: "black" },
                    { name: "Green", value: "green" }
                )
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

            const query = await db.query("SELECT balance, lastRouletteTime FROM economy WHERE userId = ?", [interactionUserId]);
            const userBalance = query[0]?.balance;

            const lastRouletteTime = query[0]?.lastRouletteTime;
            const nextApprovedRouletteTimeUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000 - 15 * 60000); //15 minutes

            const cooldownCheck = await checkCooldown(commandName, interaction);
            if (cooldownCheck) {
                return await interaction.reply({ embeds: [cooldownCheck] });
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
                    "Roulette - Error",
                    `You can't play without money.\nPlease enter a positive amount that's in you balance range.\nYour current balance is \`$${userBalance}\`.`,
                    interaction
                );
            }
            else {
                const validColors = ["red", "black", "green"];
                const guessedColor = interaction.options.getString("color");

                const randomOutcome = generate.generateRandomOutcome();
                const randomColor = randomOutcome.color;
                const randomNumber = randomOutcome.number;

                if(!validColors.includes(guessedColor)) {
                    var embedReply = embedReplyFailureColor(
                        "Roulette - Error",
                        "The color you've chosen is invalid.\nPlease choose from `red`, `black` or `green`.",
                        interaction
                    );
                }
                else if (guessedColor === randomColor) {
                    if (guessedColor === "green") {
                        await db.query("UPDATE economy SET balance = balance + ?, lastRouletteTime = ? WHERE userId = ?",
                            [
                                amount * 35,
                                new Date().toISOString().slice(0, 19).replace('T', ' '),
                                interactionUserId
                            ]
                        );

                        var embedReply = embedReplySuccessColor(
                            "Roulette - Jackpot",
                            `The ball landed on **${format.formatRouletteColor(randomColor)} ${randomNumber}**.\nYour guess was **${format.formatRouletteColor(guessedColor)}**.\nYou hit the jackpot, and won \`$${amount * 35}\`! :money_mouth:`,
                            interaction
                        );
                    }
                    else {
                        await db.query("UPDATE economy SET balance = balance + ?, lastRouletteTime = ? WHERE userId = ?",
                            [
                                amount,
                                new Date().toISOString().slice(0, 19).replace('T', ' '),
                                interactionUserId
                            ]
                        );

                        var embedReply = embedReplySuccessColor(
                            "Roulette - Won",
                            `The ball landed on **${format.formatRouletteColor(randomColor)} ${randomNumber}**.\nYour guess was **${format.formatRouletteColor(guessedColor)}** as well!\nYou won \`$${amount * 2}\`. :money_mouth:`,
                            interaction
                        );
                    }
                }
                else {
                    await db.query("UPDATE economy SET balance = balance - ?, lastRouletteTime = ? WHERE userId = ?",
                        [
                            amount,
                            new Date().toISOString().slice(0, 19).replace('T', ' '),
                            interactionUserId
                        ]
                    );

                    var embedReply = embedReplyWarningColor(
                        "Roulette - Lost",
                        `The ball landed on **${format.formatRouletteColor(randomColor)} ${randomNumber}**.\nYour guess was **${format.formatRouletteColor(guessedColor)}**.\nMaybe try your luck again. :upside_down:`,
                        interaction
                    );
                }
            }
        }

        await interaction.reply({ embeds: [embedReply] })
        await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
    }
}