import { PermissionFlagsBits } from "discord.js";
import { embedReplyFailureColor } from "../embeds/embed-reply.js";
import { capitalizeFirstLetter } from "../format.js";

export const checkIfNotInGuild = (commandName, interaction) => {
  if (!interaction.inGuild()) {
    const embedReply = embedReplyFailureColor(
      `${capitalizeFirstLetter(commandName)} - Not in a server`,
      `You can only use the \`/${commandName}\` command in a server.`,
      interaction
    );

    return embedReply;
  }

  return null;
};

export const checkAdminPermissions = (commandName, interaction) => {
  if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.Administrator)) {
    const embedReply = embedReplyFailureColor(
      `${capitalizeFirstLetter(commandName)} - Insufficient Permissions`,
      `This feature requires **administrator** *(8)* privileges which the bot currently lacks.\nIf you want this feature to work, please re-invite the bot with accurate privileges.`,
      interaction
    );

    return embedReply;
  }

  return null;
};
