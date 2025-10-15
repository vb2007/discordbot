import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import {
  embedReplyFailureColor,
  embedReplySuccessColor,
} from "../../helpers/embeds/embed-reply.js";
import { moderationDmEmbedReplyFailureColor } from "../../helpers/embeds/embed-reply-moderation.js";
import { logToFileAndDatabase } from "../../helpers/logger.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bans a specified member from the server.")
    .addUserOption((option) =>
      option.setName("target").setDescription("Choose your target.").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Give a reason.").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),
  async execute(interaction) {
    const targetUser = interaction.options.getUser("target");
    const reason = interaction.options.getString("reason") || "No reason provided";

    if (!interaction.inGuild()) {
      var embedReply = embedReplyFailureColor(
        "Ban - Error",
        "You can only ban members in a server.",
        interaction
      );
    } else if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
      var embedReply = embedReplyFailureColor(
        "Ban - Error",
        "Bot lacks the ban permission, cannot ban the member.",
        interaction
      );
    } else {
      try {
        await interaction.guild.members.ban(targetUser, { reason: reason });

        var replyContent = `Successfully banned user ${targetUser.tag} for: ${reason}`;

        try {
          const embedDmReply = moderationDmEmbedReplyFailureColor(
            "You have been banned.",
            `You have banned from **${interaction.guild.name}** for: **${reason}** \nIf you believe this was a mistake, please contact a moderator.`,
            interaction
          );

          await targetUser.send({ embeds: [embedDmReply] });
          replyContent += "\nThe user was notified about the action & reason in their DMs.";
        } catch (error) {
          console.error(error);
          replyContent += "\nThere was an error while trying to DM the user.";
        }

        var embedReply = embedReplySuccessColor("Ban - Success", replyContent, interaction);
      } catch (error) {
        console.error(error);

        var embedReply = embedReplyFailureColor(
          "Ban - Error",
          "There was an error while trying to ban the user.",
          interaction
        );
      }
    }

    await interaction.reply({ embeds: [embedReply] });
    await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
  },
};
