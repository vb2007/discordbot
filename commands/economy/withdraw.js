const { SlashCommandBuilder } = require("discord.js");
const { embedReplySuccessColor, embedReplyFailureColor } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("withdraw")
        .setDescription("Withdraws a specified amount of money from your bank account.")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("The amount of money you want to withdraw.")
                .setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
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
        }
        else {
            await db.query("UPDATE economy SET balance = balance + ?, balanceInBank = balanceInBank - ? WHERE userId = ?",
                [
                    amount,
                    amount,
                    interactionUserId
                ]
            );

            var embedReply = embedReplySuccessColor(
                "Withdraw successful.",
                `You've successfully withdrawn \`$${amount}\` from your bank account.\nYour current balance in the bank is \`$${balanceInBank - amount}\`. :bank:\nYour current balance is \`$${balance + amount}\`. :moneybag:`,
                interaction
            );
        }

        await interaction.reply({ embeds: [embedReply] });

        //logging
        const response = JSON.stringify(embedReply.toJSON());
        await logToFileAndDatabase(interaction, response);
    }
}    