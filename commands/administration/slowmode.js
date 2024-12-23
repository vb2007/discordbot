const { SlashCommandBuilder, PermissionFlagsBits, InviteType } = require("discord.js");
const { embedReplyFailureColor, embedReplySuccessColor, embedReplyWarningColor, moderationDmEmbedReplyWarningColor } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("slowmode")
        .setDescription("Sets / modifies the slowmode for a channel.")
        .addIntegerOption(option =>
            option
                .setName("time")
                .setDescription("The time you would like to set slowmode for (in seconds, max 21600).")
                .setMinValue(0)
                .setMaxValue(21600)
                .setRequired(true))
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
            const targetTime = interaction.options.getInteger("time");
            const channel = interaction.options.getChannel("channel") || interaction.channel;

            try {
                await channel.setRateLimitPerUser(targetTime);

                var embedReply = embedReplySuccessColor(
                    "Slowmode: Success",
                    `Successfully set slowmode to **${targetTime} seconds** for channel <#${channel.id}>.`,
                    interaction
                );
            }
            catch (error) {
                var embedReply = embedReplyFailureColor(
                    "Slowmode: Error",
                    "An error occurred while trying to set slowmode for the channel.",
                    interaction
                );
                console.error(error.stack);
            }
        }

        await interaction.reply({ embeds: [embedReply] });
        await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
    }
}