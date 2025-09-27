const fs = require("fs");
const path = require("path");
const db = require("./db");
const { logToFile, logToDatabase } = require("../../config.json");

const logToFileAndDatabase = async (interaction, response) => {
  //logging to file
  if (logToFile == "True") {
    const logDirectory = path.join(__dirname, "../command-logs");

    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory, { recursive: true });
    }

    const logMessage = `Command: ${interaction.commandName}
Executor: ${interaction.user.tag} (ID: ${interaction.user.id})
Server: ${interaction.inGuild() ? `${interaction.guild.name} (ID: ${interaction.guild.id})` : "Not in a server."}
Channel: ${interaction.inGuild() ? `${interaction.channel.name} (ID ${interaction.channel.id})` : "Not in a server."}
Time: ${new Date().toLocaleString()}
Response: ${response}\n\n`;

    const logFilePath = path.join(logDirectory, `${interaction.commandName}.log`);

    fs.appendFile(logFilePath, logMessage, (error) => {
      if (error) {
        console.error("Error while wrinting logs to fie: ", error);
      }
    });
  }

  //logging to database
  if (logToDatabase == "True") {
    try {
      let isInServer, guildName, guildId, channelName, channelId;

      if ((isInServer = interaction.inGuild())) {
        isInServer = 1;
        guildName = interaction.guild.name;
        guildId = parseInt(interaction.guild.id);
        channelName = interaction.channel.name;
        channelId = parseInt(interaction.channel.id);
      } else {
        isInServer = 0;
        guildName = null;
        guildId = null;
        channelName = null;
        channelId = null;
      }

      //insert data into the commandUsageLog table
      await db.query(
        `INSERT INTO commandUsageLog (commandName, executorUserName, executorUserId, isInServer, serverName, serverId, channelName, channelId, usageTime, response) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          interaction.commandName,
          interaction.user.username,
          parseInt(interaction.user.id),
          isInServer,
          guildName,
          guildId,
          channelName,
          channelId,
          new Date().toISOString().slice(0, 19).replace("T", " "),
          response,
        ]
      );
    } catch (error) {
      console.error("Error while writing logs to database: ", error);
    }
  }
};

module.exports = { logToFileAndDatabase };
