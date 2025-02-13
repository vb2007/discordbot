const { SlashCommandBuilder } = require("discord.js");
const { embedReplySuccessColor, embedReplyFailureColor, embedReplyWarningColor } = require("../../helpers/embeds/embed-reply");
const { checkIfNotInGuild } = require("../../helpers/command-validation/general");
const { checkCooldown, checkBalanceAndBetAmount } = require("../../helpers/command-validation/economy");
const replyAndLog = require("../../helpers/reply");
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
        const guildCheck = checkIfNotInGuild(commandName, interaction);
        if (guildCheck) {
            return await replyAndLog(interaction, guildCheck);
        }

        const amount = interaction.options.getInteger("amount");

        const balanceCheck = await checkBalanceAndBetAmount(commandName, interaction, amount);
        if (balanceCheck) {
            return await replyAndLog(interaction, balanceCheck);
        }

        const cooldownCheck = await checkCooldown(commandName, interaction);
        if (cooldownCheck) {
            return await replyAndLog(interaction, cooldownCheck);
        }

        const interactionUserId = interaction.user.id;

        const validColors = ["red", "black", "green"];
        const guessedColor = interaction.options.getString("color");

        if(!validColors.includes(guessedColor)) {
            var embedReply = embedReplyFailureColor(
                "Roulette - Error",
                "The color you've chosen is invalid.\nPlease choose from `red`, `black` or `green`.",
                interaction
            );

            return await replyAndLog(interaction, cooldownCheck);
        }

        const randomOutcome = generate.generateRandomOutcome();
        const randomColor = randomOutcome.color;
        const randomNumber = randomOutcome.number;

        if (guessedColor === randomColor) {
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

        return await replyAndLog(interaction, embedReply);
    }
}