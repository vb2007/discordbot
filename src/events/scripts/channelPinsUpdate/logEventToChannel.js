import { getGuildFromDB } from "../../../helpers/log-data-query.js";
import { embedMessageSuccessSecondaryColor } from "../../../helpers/embeds/embed-message.js";

export const sendLogInfo = async (client, channel) => {
  try {
    const guild = await client.guilds.fetch(channel.guildId);
    const { doesGuildExist, logChannelId } = await getGuildFromDB(channel.guildId);

    if (doesGuildExist) {
      const logChannel = guild.channels.cache.get(logChannelId);

      const logEmbed = embedMessageSuccessSecondaryColor(
        "Channel pins updated",
        `The channel pins were updated in <#${channel.id}>.`
      );

      await logChannel.send({ embeds: [logEmbed] });
    }
  } catch (error) {
    console.error(`Failed to send message pin log info to target channel: ${error}`);
  }
};
