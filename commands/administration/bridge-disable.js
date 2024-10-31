const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { embedReplySuccessColor, embedReplyFailureColor } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bridge-disable")
        .setDescription("Disables bridging from a source channel on another server.")
        .addStringOption(option =>
            option
                .setName("source-channel-id")
                .setDescription("The ID of the source channel you want to disable the briding for on another server.")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            var embedReply = embedReplyFailureColor(
                "Bridge Disable: Error",
                "You can only disable bridging in a server.",
                interaction
            );
        }
        else {
            try {
                const sourceChannelId = interaction.options.getString("source-channel-id");
                const guildId = interaction.guild.id;

                const query = await db.query("SELECT sourceChannelId FROM configBridging WHERE sourceChannelId = ? AND destinationGuildId = ?", [sourceChannelId, guildId]);
                const existingGuildId = query[0]?.guildId || null;
                const existingSourceChannelId = query[0]?.sourceChannelId || null;

                if (existingSourceChannelId && existingGuildId) {
                    await db.query("DELETE FROM configBridging WHERE sourceChannelId = ? AND destinationGuildId = ?", [sourceChannelId, guildId]);
                    var embedReply = embedReplySuccessColor(
                        "Bridge Disable: Success",
                        `Bridging has been disabled for the channel <#${sourceChannelId}> (\`${sourceChannelId}\`). :white_check_mark:\nYou can re-enable this feature with \`/bridge-configure\`.`,
                        interaction
                    );
                }
                else {
                    var embedReply = embedReplyFailureColor(
                        "Bridge Disable: Error",
                        `Bridging has not been configured for the channel <#${sourceChannelId}> (\`${sourceChannelId}\`). :x:\nTherefore, you can't disable it.\nYou can enable this feature with \`/bridge-configure\`.`,
                        interaction
                    );
                }
            }
            catch (error) {
                console.error(`Error while disabling bridging: ${error}`);
                var embedReply = embedReplyFailureColor(
                    "Bridge Disable: Error",
                    "An error occurred while disabling the bridging feature.\nPlease try again.",
                    interaction
                );
            }
        }
    }
}