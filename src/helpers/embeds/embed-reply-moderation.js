import { EmbedBuilder } from "discord.js";
import config from "../../../config.json" with { type: "json" };

const { embedColors } = config;

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {interaction} interaction - Interaction object from the command
 * @returns {embedDmReply} An embed reply object
 */
export const moderationDmEmbedReplyFailureColor = (title, description, interaction) => {
  const embedDmReply = new EmbedBuilder({
    color: parseInt(embedColors.failure),
    title: title,
    description: description,
    timestamp: new Date().toISOString(),
    footer: {
      text: `Moderator: ${interaction.user.username}`,
      icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
    },
  });

  return embedDmReply;
};

/**
 * @param {title} title - Embed's title
 * @param {description} description - Embed's description
 * @param {interaction} interaction - Interaction object from the command
 * @returns {embedDmReply} An embed reply object
 */
export const moderationDmEmbedReplyWarningColor = (title, description, interaction) => {
  const embedDmReply = new EmbedBuilder({
    color: parseInt(embedColors.warning),
    title: title,
    description: description,
    timestamp: new Date().toISOString(),
    footer: {
      text: `Moderator: ${interaction.user.username}`,
      icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
    },
  });

  return embedDmReply;
};
