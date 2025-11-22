import { logToFileAndDatabase } from "./logger.js";

export const replyAndLog = async (interaction, embedReply) => {
  await interaction.reply({ embeds: [embedReply] });
  await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
};

export const baseReplyAndLog = async (interaction, messageContent) => {
  await interaction.reply(messageContent);
  await logToFileAndDatabase(interaction, messageContent);
};
