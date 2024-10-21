const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { embedReplyFailureColor, embedReplySuccessColor, embedReplyWarningColor, moderationDmEmbedReplyWarningColor } = require("../../helpers/embeds/embed-reply");
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
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(32))
        .setDefaultMemberPermissions(PermissionFlagsBits.ChangeNickname)
        .setDMPermission(false),
    async execute(interaction) {
        const targetUser = interaction.options.getMember("target");
        const targetUserId = interaction.options.getMember("target").id;
        const targetUserUsername = interaction.options.getMember("target").user.globalName;
        const targetNickname = interaction.options.getString("nickname");

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
        else if (targetNickname.length > 32 || targetNickname.length < 2) {
            var embedReply = embedReplyFailureColor(
                "Rename: Error",
                "The username length you've provided is invalid!\nMinimum length: **2 characters**.\nMaximum length: **32 characters**.",
                interaction
            );
        }
        else {
            try {
                await targetUser.setNickname(targetNickname);

                try {
                    var embedDmReply = moderationDmEmbedReplyWarningColor(
                        "Rename: Action regarding your account",
                        `You have been renamed in **${interaction.guild.name}** to \`${targetNickname}\`.`,
                        interaction
                    );

                    var embedReply = embedReplySuccessColor(
                        "Rename: Success",
                        `Successfully renamed **${targetUserUsername}** (<@${targetUserId}>) to \`${targetNickname}\`.\nThey were notified about the action in their DMs.`,
                        interaction
                    );

                    await targetUser.send({ embeds: [embedDmReply] });
                }
                catch (error) {
                    var embedReply = embedReplyWarningColor(
                        "Rename: Warning",
                        `Successfully renamed **${targetUserUsername}** (<@${targetUserId}>) to \`${targetNickname}\`.\nHowever, there was an error while trying to DM the user.`,
                        interaction
                    );
                }
            }
            catch (error) {
                if (error.code === 50013) { //currently "50013" corresponds to the "Missing Permissions" error
                    var embedReply = embedReplyFailureColor(
                        "Rename: Error",
                        `Bot **lacks the manage nicknames / rename permission**, or **the bot's role is lower in the role hierarchy, than the target user's highest role**.\nFailed to rename <@${targetUserId}> to \`${targetNickname}\`.`,
                        interaction
                    );
                }
                else {
                    var embedReply = embedReplyFailureColor(
                        "Rename: Error",
                        `Failed to rename <@${targetUserId}> to \`${targetNickname}\`.`,
                        interaction
                    );
                }
                // console.error(error);
            }
        }

        await interaction.reply({ embeds: [embedReply] });

        //logging
        const response = JSON.stringify(embedReply.toJSON());
        await logToFileAndDatabase(interaction, response);
    }
}