const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { embedReplyFailureColor, embedReplyWarningColor, embedReplySuccessColor } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("welcome-disable")
        .setDescription("Disables welcome messages for the current server.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            var embedReply = embedReplyFailureColor(
                "Welcome Disable: Error",
                "You can only disable the welcome messages in a server.",
                interaction
            );
        }
        else if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.Administrator)) {
            var embedReply = embedReplyFailureColor(
                "Welcome Disable: Error",
                "This feature requires **administrator** *(8)* privileges which the bot currently lacks.\nIf you want this feature to work, please re-invite the bot with accurate privileges.",
                interaction
            );
        }
        else {
            try {
                const currentGuildId = interaction.guild.id;
                const query = await db.query("SELECT guildId FROM configWelcome WHERE guildId = ?", [currentGuildId]);
                const welcomeGuildId = query[0]?.guildId || null;

                if (welcomeGuildId) {
                    await db.query("DELETE FROM configWelcome WHERE guildId = ?", [welcomeGuildId]);

                    var embedReply = embedReplySuccessColor(
                        "Welcome Disable: Success",
                        "The welcome messages have been disabled successfully for this server.\nYou can re-enable them with the `/welcome-configure` command.",
                        interaction
                    );
                }
                else {
                    var embedReply = embedReplyWarningColor(
                        "Welcome Disable: Warning",
                        "Welcome messages have not been configured for this server.\nTherefore, you can't disable them.\nYou can enable this feature with the `/welcome-configure` command.",
                        interaction
                    );
                }
            }
            catch (error) {
                var embedReply = embedReplyFailureColor(
                    "Welcome Disable: Error",
                    "There was an error while trying to disable the welcome messages.",
                    interaction
                );
            }
        }

        await interaction.reply({ embeds: [embedReply] });
        await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
    }
}