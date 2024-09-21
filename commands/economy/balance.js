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

                var localEmbedResponse = embedReplyPrimaryColor(
                    "Balance",
                    `<@${interactionUserId}>'s balance is \`$${query[0]?.balance}\`. :moneybag:\nTheir bank balance is \`$${query[0]?.balanceInBank}\`. :bank:`,
                    interaction
                );
            }
            else {
                var query = await db.query("SELECT balance, balanceInBank FROM economy WHERE userId = ?", [targetUserId]);

                var localEmbedResponse = embedReplyPrimaryColor(
                    "Balance",
                    `<@${targetUserId}>'s balance is **${query[0]?.balance}**. :moneybag:\nTheir bank balance is **${query[0]?.balanceInBank}**. :bank:`,
                    interaction
                );
            }
        }

        await interaction.reply({ embeds: [localEmbedResponse] });

        //logging
        const response = JSON.stringify(localEmbedResponse.toJSON());
        await logToFileAndDatabase(interaction, response);
    }
}