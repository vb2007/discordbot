import { query } from "../../../helpers/db.js";
import { embedMessagePrimaryColorWithFields } from "../../../helpers/embeds/embed-message.js";

export const sendMessageToDestinationChannel = async (client, message) => {
  // const serverId = message.guild.id;
  const channelId = message.channel.id;
  const messageContent = message.content;
  const senderUserName = message.author.username;
  // const senderUserId = message.author.id;
  const serverName = message.guild.name;
  // const channelName = message.channel.name;

  try {
    const result = await query(
      "SELECT sourceChannelId, destinationChannelId, destinationGuildId FROM configBridging"
    );
    const sourceChannelId = result[0]?.sourceChannelId || null;
    const destinationChannelId = result[0]?.destinationChannelId || null;
    // const destinationGuildId = query[0]?.destinationGuildId || null;

    if (sourceChannelId == message.channel.id) {
      const destinationChannel = await client.channels.fetch(destinationChannelId);
      // const destinationChannel = await destinationGuild.channels.cache.get(destinationChannelId);

      const embedMessage = embedMessagePrimaryColorWithFields(
        "Bridged Message",
        `Message successfully bridged from <#${channelId}>.`,
        [
          { name: "Sender username", value: senderUserName, inline: true },
          { name: "Server name", value: serverName, inline: true },
          { name: "Message", value: messageContent },
        ]
      );

      await destinationChannel.send({ embeds: [embedMessage] });
    }
  } catch (error) {
    console.error(`Failed to bridge message: ${error}`);
  }
};
