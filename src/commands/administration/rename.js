const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const {
  embedReplyFailureColor,
  embedReplySuccessColor,
  embedReplyWarningColor,
  moderationDmEmbedReplyWarningColor,
} = require("../../helpers/embeds/embed-reply");
const { checkIfNotInGuild } = require("../../helpers/command-validation/general");
const replyAndLog = require("../../helpers/reply");

const commandName = "rename";

module.exports = {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Renames a specified user.")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The person you would like to rename.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("nickname")
        .setDescription("The new name your target user will have.")
        .setRequired(true)
        .setMinLength(2)
        .setMaxLength(32)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ChangeNickname)
    .setDMPermission(false),
  async execute(interaction) {
    let title;
    let description;

    const guildCheck = checkIfNotInGuild(commandName, interaction);
    if (guildCheck) {
      return await replyAndLog(interaction, guildCheck);
    }

    const targetUser = interaction.options.getMember("target");
    const targetUserId = interaction.options.getMember("target").id;
    const targetUserUsername = interaction.options.getMember("target").user.globalName;
    const targetNickname = interaction.options.getString("nickname");

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ChangeNickname)) {
      title = "Rename: Error";
      description =
        "Bot **lacks the manage nicknames / rename permission**, cannot rename the user.";
      return replyAndLog(interaction, embedReplyFailureColor(title, description, interaction));
    }

    if (targetNickname.length > 32 || targetNickname.length < 2) {
      title = "Rename: Error";
      description = `The username length you've provided is invalid!\nMinimum length: **2 characters**.\nMaximum length: **32 characters**.`;
      return replyAndLog(interaction, embedReplyFailureColor(title, description, interaction));
    }

    try {
      await targetUser.setNickname(targetNickname);

      try {
        var embedDmReply = moderationDmEmbedReplyWarningColor(
          "Rename: Action regarding your account",
          `You have been renamed in **${interaction.guild.name}** to \`${targetNickname}\`.`,
          interaction
        );

        await targetUser.send({ embeds: [embedDmReply] });

        title = "Rename: Success";
        description = `Successfully renamed **${targetUserUsername}** (<@${targetUserId}>) to \`${targetNickname}\`. They were notified about the action in their DMs.`;
        return replyAndLog(interaction, embedReplySuccessColor(title, description, interaction));
      } catch (error) {
        title = "Rename: Partial Success";
        description = `Successfully renamed **${targetUserUsername}** (<@${targetUserId}>) to \`${targetNickname}\`.\nHowever, there was an error while trying to DM the user.`;
        return replyAndLog(interaction, embedReplyWarningColor(title, description, interaction));
      }
    } catch (error) {
      if (error.code === 50013) {
        //currently "50013" corresponds to the "Missing Permissions" error
        title = "Rename: Error";
        description = `Bot **lacks the manage nicknames / rename permission**, or **the bot's role is lower in the role hierarchy, than the target user's highest role**.\nFailed to rename <@${targetUserId}> to \`${targetNickname}\`.`;
        return replyAndLog(interaction, embedReplyFailureColor(title, description, interaction));
      }

      console.error(`Error while running ${commandName}: ${error}`);

      title = "Rename: Error";
      description = `An error occurred while trying to rename <@${targetUserId}> to \`${targetNickname}\`.`;
      return replyAndLog(interaction, embedReplyFailureColor(title, description, interaction));
    }
  },
};
