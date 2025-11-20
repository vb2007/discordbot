import { query } from "../../../helpers/db.js";
import config from "../../../../config.json" with { type: "json" };
const { logMessagesToLocalDatabase } = config;

export const logToDB = async (message) => {
  try {
    if (logMessagesToLocalDatabase == "True") {
      if (message.author?.bot) return;

      const messageContent = message.content;
      const senderUserName = message.author.username;
      const senderUserId = message.author.id;
      const serverName = message.guild.name;
      const serverId = message.guild.id;
      const channelName = message.channel.name;
      const channelId = message.channel.id;

      if (messageContent !== "") {
        await query(
          "INSERT INTO messageLog (messageContent, senderUserName, senderUserId, serverName, serverId, channelName, channelId) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            messageContent,
            senderUserName,
            senderUserId,
            serverName,
            serverId,
            channelName,
            channelId,
          ]
        );

        // console.log(
        //   `Logged message "${message.content}" to database from ${senderUserName} in ${serverName}.`
        // );
      }
    }
  } catch (error) {
    console.error(`Failed to log message: ${error}`);
  }
};
