const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const db = require("../../db");
const { logToFileAndDatabase } = require("../../logger");

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
            var replyContent = "You can only check a member's balance in a server.";
        }
        else {
            const interactionUserId = interaction.user.id;
            const targetUserId = interaction.options.getUser("user")?.id || null;

            if(!targetUserId) {
                var query = await db.query("SELECT balance FROM economy WHERE userId = ?", [interactionUserId]);
                var userId = query[0]?.userId;

                var replyContent = `<@${userId}>'s balance is **${query[0]?.balance}**. :moneybag:`;
            }
            else {
                var query = await db.query("SELECT balance FROM economy WHERE userId = ?", [targetUserId]);
                var userId = query[0]?.userId;

                var replyContent = `<@${userId}>'s balance is **${query[0]?.balance}**. :moneybag:`;
            }
        }

        var embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: "Checking user balance.",
            description: replyContent,
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}`,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true })
            }
        });

        await interaction.reply({ embeds: [embedReply] });

        //logging
        const response = JSON.stringify(embedReply.toJSON());
        await logToFileAndDatabase(interaction, response);
    }
}