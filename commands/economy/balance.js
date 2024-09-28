const { SlashCommandBuilder } = require("discord.js");
const { embedReplyPrimaryColor, embedReplyFailureColor } = require("../../helpers/embed-reply");
const db = require("../../helpers/db");
const { logToFileAndDatabase } = require("../../helpers/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Displays a user's balance.")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("Choose who's balance you'd like to see.")
                .setRequired(false))
        .setDMPermission(false),
    async execute(interaction) {
        if(!interaction.inGuild()) {
            var localEmbedResponse = embedReplyFailureColor(
                "Balance: Error",
                "You can only check a member's balance in a server.",
                interaction
            );
        }
        else {
            const interactionUserId = interaction.user.id;
            const targetUserId = interaction.options.getUser("user")?.id || null;

            if(!targetUserId) {
                var query = await db.query("SELECT balance, balanceInBank FROM economy WHERE userId = ?", [interactionUserId]);
                const balance = query[0]?.balance;
                const balanceInBank = query[0]?.balanceInBank;

                var localEmbedResponse = embedReplyPrimaryColor(
                    "Balance",
                    `Your (<@${interactionUserId}>) balance is \`$${balance}\`. :moneybag:\nAnd your bank balance is \`$${balanceInBank}\`. :bank:`,
                    interaction
                );

                if (!balance || balance == 0) {
                    var localEmbedResponse = embedReplyPrimaryColor(
                        "Balance",
                        `You (<@${interactionUserId}>) have no money in your wallet. :moneybag:\nAnd your bank balance is \`$${balanceInBank}\`. :bank:`,
                        interaction
                    );
                }

                if (!balanceInBank || balanceInBank == 0) {
                    var localEmbedResponse = embedReplyPrimaryColor(
                        "Balance",
                        `Your (<@${interactionUserId}>) balance is \`$${balance}\`. :moneybag:\nAnd you have no money in your bank. :bank:`,
                        interaction
                    );
                }

                if ((!balance || balance == 0) && (!balanceInBank || balanceInBank == 0)) {
                    var localEmbedResponse = embedReplyPrimaryColor(
                        "Balance",
                        `You (<@${interactionUserId}>) have no money in your wallet. :moneybag:\nAnd you have no money in your bank. :bank:`,
                        interaction
                    );
                }
            }
            else {
                var query = await db.query("SELECT balance, balanceInBank FROM economy WHERE userId = ?", [targetUserId]);
                const balance = query[0]?.balance;
                const balanceInBank = query[0]?.balanceInBank;

                var localEmbedResponse = embedReplyPrimaryColor(
                    "Balance",
                    `<@${targetUserId}>'s balance is **${balance}**. :moneybag:\nTheir bank balance is **${balanceInBank}**. :bank:`,
                    interaction
                );

                if (!balance || balance == 0) {
                    var localEmbedResponse = embedReplyPrimaryColor(
                        "Balance",
                        `<@${targetUserId}> has no money in their wallet. :moneybag:\nAnd their bank balance is \`$${balanceInBank}\`. :bank:`,
                        interaction
                    );
                }

                if (!balanceInBank || balanceInBank == 0) {
                    var localEmbedResponse = embedReplyPrimaryColor(
                        "Balance",
                        `<@${targetUserId}>'s balance is \`$${balance}\`. :moneybag:\nAnd they have no money in their bank. :bank:`,
                        interaction
                    );
                }

                if ((!balance || balance == 0) && (!balanceInBank || balanceInBank == 0)) {
                    var localEmbedResponse = embedReplyPrimaryColor(
                        "Balance",
                        `<@${targetUserId}> has no money in their wallet. :moneybag:\nAnd they have no money in their bank. :bank:`,
                        interaction
                    );
                }
            }
        }

        await interaction.reply({ embeds: [localEmbedResponse] });

        //logging
        const response = JSON.stringify(localEmbedResponse.toJSON());
        await logToFileAndDatabase(interaction, response);
    }
}