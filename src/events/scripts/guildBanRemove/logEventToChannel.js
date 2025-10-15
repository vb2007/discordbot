import { getGuildFromDB } from "../../../helpers/log-data-query.js";
import { embedMessageSuccessColorWithFields } from "../../../helpers/embeds/embed-message.js";

export const sendLogInfo = async (client, unban) => {
  try {
    const guild = await client.guilds.fetch(unban.guild.id);
    const { doesGuildExist, logChannelId } = await getGuildFromDB(unban.guild.id);

    if (doesGuildExist) {
      const logChannel = guild.channels.cache.get(logChannelId);

      const logEmbed = embedMessageSuccessColorWithFields(
        "Member unbanned",
        `<@${unban.user.id}> was unbanned from the server.`,
        [
          { name: "Username", value: `${unban.user.username}` },
          { name: "User Id", value: `${unban.user.id}` },
        ]
      );

      await logChannel.send({ embeds: [logEmbed] });
    }
  } catch (error) {
    console.error(`Failed to send log info to target channel: ${error}`);
  }
};
