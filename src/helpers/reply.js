const { logToFileAndDatabase } = require("./logger");

async function replyAndLog(interaction, embedReply) {
  await interaction.reply({ embeds: [embedReply] });
  await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
}

module.exports = replyAndLog;
