const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { embedReplySuccessColor, embedReplyFailureColor } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("logging-disable")
        .setDescription("Disables the logging feature for the current server.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            var embedReply = embedReplyFailureColor(
                "Logging Disable: Error",
                "You can only disable logging in a server.",
                interaction
            );
        }
        else if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.Administartor)) {
            var embedReply = embedReplyFailureColor(
                "AutoRole Disable: Error",
                "This feature requires **administrator** *(8)* privileges witch the bot currently lacks.\nIf you want this feature to work, please re-invite the bot with accurate privileges.",
                interaction
            );
        }
        else {
            try {
                const currentGuildId = interaction.guild.id;
                const query = await db.query("SELECT guildId FROM configLogging WHERE guildId = ?", [currentGuildId]);
                const existingGuildId = query[0]?.guildId || null;

                if (existingGuildId) {
                    await db.query("DELETE FROM configLogging WHERE guildId = ?", [currentGuildId]);
                    var embedReply = embedReplySuccessColor(
                        "Logging Disable: Success",
                        "The logging feature has been disabled successfully. :white_check_mark:\nYou can re-enable it with `/logging-configure`.",
                        interaction
                    );
                }
                else {
                    var embedReply = embedReplyFailureColor(
                        "Logging Disable: Error",
                        "Logging has not been configured for this server. :x:\nTherefore, you can't disable it.\nYou can enable this feature with `/logging-configure`.",
                        interaction
                    )
                }
            }
            catch (error) {
               console.error(`Error while disabling logging: ${error}`);
               var embedReply = embedReplyFailureColor(
                    "Logging Disable: Error",
                    "An error occurred while disabling the logging feature.\nPlease try again.",
                    interaction
               );
            }
        }

        await interaction.reply({ embeds: [embedReply] });
        await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
    }
}