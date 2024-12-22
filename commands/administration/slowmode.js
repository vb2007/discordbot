const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { embedReplyFailureColor, embedReplySuccessColor, embedReplyWarningColor, moderationDmEmbedReplyWarningColor } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("slowmode")
        .setDescription("Sets / modifies the slowmode for a channel.")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("The channel you would like to set slowmode for (current by default).")
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            var embedReply = embedReplyFailureColor(
                "Slowmode: Error",
                "You can only set slowmode for a channel in a server.",
                interaction
            );
        }
        else {
            try {
                
            }
            catch (error) {
                var embedReply = embedReplyFailureColor(
                    "Slowmode: Error",
                    "An error occurred while trying to set slowmode for the channel.",
                    interaction
                );
            }
        }

        await interaction.reply({ embeds: [embedReply] });
        await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
    }
}