const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { embedReplyFailureColor, embedReplySuccessColor } = require("../../helpers/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rename")
        .setDescription("Let's you rename a specified user.")
        .addUserOption(option =>
            option
                .setName("target")
                .setDescription("The person you would like to rename.")
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName("nickname")
                .setDescription("The new name your target user will have.")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ChangeNickname)
        .setDMPermission(false),
    async execute(interaction) {

        if (!interaction.inGuild()) {
            var embedReply = embedReplyFailureColor(
                "Rename: Error",
                "You can only rename users in a server.",
                interaction
            );
        }
        else if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ChangeNickname)) {
            var embedReply = embedReplyFailureColor(
                "Rename: Error",
                "Bot **lacks the manage nicknames / rename permission**, cannot rename the user.",
                interaction
            );
        }
        else {
            const targetUser = interaction.options.getMember("target");
            const targetUserId = interaction.options.getMember("target").id;
            const targetNickname = interaction.options.getString("nickname");

            try {
                await targetUser.setNickname(null);
                var embedReply = embedReplySuccessColor(
                    "Rename: Success",
                    `Successfully renamed ${targetUser}.`,
                    interaction
                );
            }
            catch (error) {
                logToFileAndDatabase(error);
                var embedReply = embedReplyFailureColor(
                    "Rename: Error",
                    `Failed to rename ${targetUser}.`,
                    interaction
                );
            }
        }
    }
}