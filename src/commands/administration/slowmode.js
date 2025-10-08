const { SlashCommandBuilder, PermissionFlagsBits, InviteType } = require("discord.js");
const {
  embedReplyFailureColor,
  embedReplySuccessColor,
  embedReplyWarningColor,
  moderationDmEmbedReplyWarningColor,
} = require("../../helpers/embeds/embed-reply");
const { checkIfNotInGuild } = require("../../helpers/command-validation/general");
const replyAndLog = require("../../helpers/reply");

const commandName = "slowmode";

module.exports = {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Sets / modifies the slowmode for a channel.")
    .addIntegerOption((option) =>
      option
        .setName("time")
        .setDescription("The time you would like to set slowmode for (in seconds, max 21600).")
        .setMinValue(0)
        .setMaxValue(21600)
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel you would like to set slowmode for (current by default).")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),
  async execute(interaction) {
    let title;
    let description;

    const guildCheck = checkIfNotInGuild(commandName, interaction);
    if (guildCheck) {
      return await replyAndLog(interaction, guildCheck);
    }

    const targetTime = interaction.options.getInteger("time");
    const channel = interaction.options.getChannel("channel") || interaction.channel;

    try {
      await channel.setRateLimitPerUser(targetTime);

      title = "Slowmode: Success";
      description = `Successfully set slowmode to **${targetTime} seconds** for channel <#${channel.id}>.`;
      return replyAndLog(interaction, embedReplySuccessColor(title, description, interaction));
    } catch (error) {
      console.error(`Error while running ${commandName}: ${error}`);

      title = "Slowmode: Error";
      description = "An error occurred while trying to set slowmode for the channel.";
      return replyAndLog(interaction, embedReplyFailureColor(title, description, interaction));
    }
  },
};
