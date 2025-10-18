import { logToFileAndDatabase } from "./logger.js";

export const replyAndLog = async (interaction, embedReply) => {
  await interaction.reply({ embeds: [embedReply] });
  await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
};
