const { SlashCommandBuilder } = require("discord.js");
const { embedReplySuccessColor, embedReplyFailureColor } = require("../../helpers/embeds/embed-reply");
const { checkIfNotInGuild } = require("../../helpers/command-validation/general");
const replyAndLog = require("../../helpers/reply");
const db = require("../../helpers/db");

const commandName = "withdraw";

module.exports = {
    data: new SlashCommandBuilder()
        .setName(commandName)
        .setDescription("Withdraws a specified amount of money from your bank account.")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("The amount of money you want to withdraw.")
                .setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        const guildCheck = checkIfNotInGuild(commandName, interaction);
        if (guildCheck) {
            return await replyAndLog(interaction, guildCheck);
        }

        const amount = interaction.options.getInteger("amount");
        const interactionUserId = interaction.user.id;
        const query = await db.query("SELECT balance, balanceInBank FROM economy WHERE userId = ?", [interactionUserId]);
        const balance = Number(query[0]?.balance) || 0;
        const balanceInBank = Number(query[0]?.balanceInBank) || 0;

        if (balanceInBank < amount) {
            var embedReply = embedReplyFailureColor(
                "Withdraw - Error",
                `You can't withdraw that much money from your bank account.\nYour current bank balance is only \`$${balanceInBank}\`. :bank:`,
                interaction
            );

            return await replyAndLog(interaction, embedReply);
        }

        await db.query("UPDATE economy SET balance = balance + ?, balanceInBank = balanceInBank - ? WHERE userId = ?",
            [
                amount,
                amount,
                interactionUserId
            ]
        );

        var embedReply = embedReplySuccessColor(
            "Withdraw - Success",
            `You've successfully withdrawn \`$${amount}\` from your bank account.\nYour current balance in the bank is \`$${balanceInBank - amount}\`. :bank:\nYour current balance is \`$${balance + amount}\`. :moneybag:`,
            interaction
        );

        return await replyAndLog(interaction, embedReply);
    }
}    