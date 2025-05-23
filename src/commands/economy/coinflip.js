const { SlashCommandBuilder } = require("discord.js");
const { embedReplySuccessColor, embedReplyFailureColor } = require("../../helpers/embeds/embed-reply");
const { checkIfNotInGuild } = require("../../helpers/command-validation/general");
const { checkCooldown, checkBalanceAndBetAmount } = require("../../helpers/command-validation/economy");
const replyAndLog = require("../../helpers/reply");
const db = require("../../helpers/db");

const commandName = "coinflip";

module.exports = {
    data: new SlashCommandBuilder()
        .setName(commandName)
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

        const query = await db.query("SELECT balance, lastCoinflipTime FROM economy WHERE userId = ?", [interactionUserId]);
        const userBalance = Number(query[0]?.balance);
        
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

            return await replyAndLog(interaction, embedReply);
        }
        
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

        return await replyAndLog(interaction, embedReply);
    }
}