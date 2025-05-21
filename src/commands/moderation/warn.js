const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { embedReplySuccessColor, embedReplyFailureColor } = require('../../helpers/embeds/embed-reply');
const { moderationDmEmbedReplyWarningColor } = require('../../helpers/embeds/embed-reply-moderation');
const { logToFileAndDatabase } = require("../../helpers/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warns a specified member on the server.")
        .addUserOption(option =>
            option
                .setName("target")
                .setDescription("Choose your target.")
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Give a reason.")
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const targetUser = interaction.options.getUser("target");
        const reason = interaction.options.getString("reason") || "No reason provided";

        if (!interaction.inGuild()) {
            var embedReply = embedReplyFailureColor(
                "Warn - Error",
                "You can only warn members in a server.",
                interaction
            );
        }
        else if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            var embedReply = embedReplyFailureColor(
                "Warn - Error",
                "Bot **lacks the timeout (moderation) permission**, cannot warn member.",
                interaction
            );
        }
        else{
            try{
                const embedDmReply = moderationDmEmbedReplyWarningColor(
                    "You have been warned.",
                    `You have been warned in **${interaction.guild.name}** for: **${reason}** \nIf you believe this was a mistake, please contact a moderator.`,
                    interaction
                );

                await targetUser.send({ embeds: [embedDmReply] });
                var embedReply = embedReplySuccessColor(
                    "Warn - Success",
                    `Successfully warned user **${targetUser.tag}** for: **${reason}**.\nThey've been notified about the warn in their DMs.`,
                    interaction
                );
            }
            catch (error){
                console.error(error);
                var embedReply = embedReplyFailureColor(
                    "Warn - Error",
                    "There was an error while trying to warn the user.",
                    interaction
                );
            }
        }

        await interaction.reply({ embeds: [embedReply] });
        await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
    }
}    