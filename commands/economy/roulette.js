const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { logToFileAndDatabase } = require("../../helpers/logger");
const format = require("../../helpers/format");
const generate = require("../../helpers/generate");
const db = require("../../helpers/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("roulette")
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
            var replyContent = "You can only play roulette in a server.";
        }
        else {
            const interactionUserId = interaction.user.id;
            const amount = interaction.options.getInteger("amount");

            const query = await db.query("SELECT balance, lastRouletteTime FROM economy WHERE userId = ?", [interactionUserId]);
            const userBalance = query[0]?.balance;

            const lastRouletteTime = query[0]?.lastRouletteTime;
            const nextApprovedRouletteTimeUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000 - 15 * 60000); //15 minutes

            if(lastRouletteTime >= nextApprovedRouletteTimeUTC) {
                const remainingTimeInSeconds = Math.ceil((lastRouletteTime.getTime() - nextApprovedRouletteTimeUTC.getTime()) / 1000);
                const remainingMinutes = Math.floor(remainingTimeInSeconds / 60);
                const remainingSeconds = remainingTimeInSeconds % 60;

                var replyContent = `You've already played roulette in the last 15 minutes.\nPlease wait **${remainingMinutes} minute(s)** and **${remainingSeconds} second(s)** before trying to **play roulette** again.`;
            }
            else if (userBalance < amount) {
                var replyContent = `You can't play with that much money!\nYour current balance is only \`$${userBalance}\`.`;
            }
            else if (amount <= 0) {
                var replyContent = `You can't play without money.\nPlease enter a positive amount that's in you balance range.\nYour current balance is \`$${userBalance}\`.`;
            }
            else {
                const validColors = ["red", "black", "green"];
                const guessedColor = interaction.options.getString("color");

                const randomOutcome = generate.generateRandomOutcome();
                const randomColor = randomOutcome.color;
                const randomNumber = randomOutcome.number;

                if(!validColors.includes(guessedColor)) {
                    var replyContent = "The color you've chosen is invalid.\nPlease choose from `red`, `black` or `green`.";
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

                        var replyContent = `The ball landed on **${format.formatRouletteColor(randomColor)} ${randomNumber}**.\nYour guess was **${format.formatRouletteColor(guessedColor)}**.\nYou hit the jackpot, and won \`$${amount * 35}\`! :money_mouth:`;
                    }
                    else {
                        await db.query("UPDATE economy SET balance = balance + ?, lastRouletteTime = ? WHERE userId = ?",
                            [
                                amount * 2,
                                new Date().toISOString().slice(0, 19).replace('T', ' '),
                                interactionUserId
                            ]
                        );

                        var replyContent = `The ball landed on **${format.formatRouletteColor(randomColor)} ${randomNumber}**.\nYour guess was **${format.formatRouletteColor(guessedColor)}** as well!\nYou won \`$${amount * 2}\`. :money_mouth:`;
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

                    var replyContent = `The ball landed on **${format.formatRouletteColor(randomColor)} ${randomNumber}**.\nYour guess was **${format.formatRouletteColor(guessedColor)}**.\nMaybe try your luck again. :upside_down:`;
                }
            }
        }

        var embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: "Playing roulette.",
            description: replyContent,
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}`,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true })
            }
        });

        await interaction.reply({ embeds: [embedReply] })

        //logging
        const response = JSON.stringify(embedReply.toJSON());
        await logToFileAndDatabase(interaction, response);
    }
}