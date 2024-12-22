const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { embedReplyFailureColor, embedReplyWarningColor, embedReplySuccessColor } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("goodbye-disable")
        .setDescription("Disables goodbye messages for the current server.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            var embedReply = embedReplyFailureColor(
                "Goodbye Disable: Error",
                "You can only disable the goodbye messages in a server.",
                interaction
            );
        }
        else if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.Administrator)) {
            var embedReply = embedReplyFailureColor(
                "Goodbye Disable: Error",
                "This feature requires **administrator** *(8)* privileges which the bot currently lacks.\nIf you want this feature to work, please re-invite the bot with accurate privileges.",
                interaction
            );
        }
        else {
            try {
                const currentGuildId = interaction.guild.id;
                const query = await db.query("SELECT guildId FROM configGoodbye WHERE guildId = ?", [currentGuildId]);
                const goodbyeGuildId = query[0]?.guildId || null;

                if (goodbyeGuildId) {
                    await db.query("DELETE FROM configGoodbye WHERE guildId = ?", [goodbyeGuildId]);

                    var embedReply = embedReplySuccessColor(
                        "Goodbye Disable: Success",
                        "The goodbye messages have been disabled successfully for this server.\nYou can re-enable them with the `/goodbye-configure` command.",
                        interaction
                    );
                }
                else {
                    var embedReply = embedReplyWarningColor(
                        "Goodbye Disable: Warning",
                        "Goodbye messages have not been configured for this server.\nTherefore, you can't disable them.\nYou can enable this feature with the `/goodbye-configure` command.",
                        interaction
                    );
                }
            }
            catch (error) {
                var embedReply = embedReplyFailureColor(
                    "Goodbye Disable: Error",
                    "There was an error while trying to disable the goodbye messages.",
                    interaction
                );
            }
        }

        await interaction.reply({ embeds: [embedReply] });
        await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
    }
}