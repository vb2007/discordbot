const { SlashCommandBuilder } = require("discord.js");
const { embedReplyFailureColor, embedReplySuccessColor } = require("../../helpers/embeds/embed-reply");
const { checkIfNotInGuild } = require("../../helpers/command-validation/general");
const replyAndLog = require("../../helpers/reply");
const db = require("../../helpers/db");

const commandName = "pay";

module.exports = {
    data: new SlashCommandBuilder()
        .setName(commandName)
        .setDescription("Pay someone a specified amount of money.")
        .addUserOption(option =>
            option
                .setName("target")
                .setDescription("The user who will receive the payment.")
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("The amount of money the target user will receive.")
                .setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        const guildCheck = checkIfNotInGuild(commandName, interaction);
        if (guildCheck) {
            return await replyAndLog(interaction, guildCheck);
        }

        const amount = interaction.options.getInteger("amount");
        
        const targetUser = interaction.options.getUser("target");
        const targetUserId = targetUser.id;
        const targetUserName = targetUser.username;
        const interactionUserId = interaction.user.id;

        if (targetUserId === interactionUserId) {
            var embedReply = embedReplyFailureColor(
                "Payment - Error",
                "You cannot issue a payment to yourself.",
                interaction
            );
        }

        const interactionUserBalanceQuery = await db.query("SELECT balance FROM economy WHERE userId = ?", [interactionUserId]);
        const userBalance = interactionUserBalanceQuery[0]?.balance || 0;

        const targetUserQuery = await db.query("SELECT * FROM economy WHERE userId = ?", [targetUserId]);
        const targetUserExists = targetUserQuery.length > 0;

        if (amount > userBalance) {
            var embedReply = embedReplyFailureColor(
                "Payment - Error",
                `You can't pay that much money to <@${targetUserId}>! :x:\nYour balance is only \`$${userBalance}\`.`,
                interaction
            );
        }
        else if (amount <= 0) {
            var embedReply = embedReplyFailureColor(
                "Payment - Error",
                `You can't pay a negative or zero amount of money to <@${targetUserId}>! :x:\nTry again with a positive amount.`,
                interaction
            );
        }
        else {
            await db.query("UPDATE economy SET balance = balance - ? WHERE userId = ?",
                [amount, interactionUserId]
            );

            if (!targetUserExists) {
                await db.query("INSERT INTO economy (userName, userId, balance) VALUES (?, ?, ?)",
                    [targetUserName, targetUserId, amount]
                );
            }
            else {
                await db.query("UPDATE economy SET balance = balance + ? WHERE userId = ?",
                    [amount, targetUserId]
                );
            }

            var embedReply = embedReplySuccessColor(
                "Payment successful",
                `<@${interactionUserId}> has successfully paid \`$${amount}\` to <@${targetUserId}>. :white_check_mark:`,
                interaction
            );
        }

        return await replyAndLog(interaction, embedReply);
    }
}