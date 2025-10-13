import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import {
  embedReplySuccessColor,
  embedReplyFailureColor,
} from "../../helpers/embeds/embed-reply.js";
import { moderationDmEmbedReplyFailureColor } from "../../helpers/embeds/embed-reply-moderation.js";
import { logToFileAndDatabase } from "../../helpers/logger.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kicks a specified member from the server.")
    .addUserOption((option) =>
      option.setName("target").setDescription("Choose your target.").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Give a reason.").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false),
  async execute(interaction) {
    const targetUser = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason") || "No reason provided";

    if (!interaction.inGuild()) {
      var embedReply = embedReplyFailureColor(
        "Kick - Error",
        "You can only kick members in a server.",
        interaction
      );
    } else if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
      var embedReply = embedReplyFailureColor(
        "Kick - Error",
        "Bot lacks the kick permission, cannot kick target member.",
        interaction
      );
    } else if (!targetUser.kickable) {
      var embedReply = embedReplyFailureColor(
        "Kick - Error",
        `The bot cannot kick user **${targetUser.tag}**.\nMaybe your, or the bot's rank is lower than theirs?`,
        interaction
      );
    } else {
      try {
        await interaction.guild.members.kick(targetUser, { reason: reason });

        var replyContent = `Successfully kicked user **${targetUser.tag}** for: **${reason}**`;

        try {
          var embedDmReply = moderationDmEmbedReplyFailureColor(
            "You have been kicked.",
            `You have kicked out from **${interaction.guild.name}** for: **${reason}** \nIf you believe this was a mistake, please contact a moderator.`,
            interaction
          );

          await targetUser.send({ embeds: [embedDmReply] });
          replyContent += "\nThe user was notified about the action & reason in their DMs.";
        } catch (error) {
          console.error(error);
          replyContent += "\nThere was an error while trying to DM the user.";
        }

        var embedReply = embedReplySuccessColor("Kick - Success", replyContent, interaction);
      } catch (error) {
        console.error(error);
        var embedReply = embedReplyFailureColor(
          "Kick - Error",
          "There was an error while trying to kick the user.",
          interaction
        );
      }
    }

    await interaction.reply({ embeds: [embedReply] });
    await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
  },
};
