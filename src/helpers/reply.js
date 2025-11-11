import { logToFileAndDatabase } from "./logger.js";

export const replyAndLog = async (interaction, embedReply) => {
  await interaction.reply({ embeds: [embedReply] });
  await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
};

export const replyAndLogWithEmbedAndDescription = async (
  interaction,
  embedReply,
  messageContent
) => {
  await interaction.reply(messageContent, { embeds: [embedReply] });
  await logToFileAndDatabase(interaction, messageContent);
};
