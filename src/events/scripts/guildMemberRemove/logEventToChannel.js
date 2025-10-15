import { getGuildFromDB } from "../../../helpers/log-data-query.js";
import { embedMessageFailureColorWithFields } from "../../../helpers/embeds/embed-message.js";

export const sendLogInfo = async (client, member) => {
  try {
    const guild = await client.guilds.fetch(member.guild.id);
    const { doesGuildExist, logChannelId } = await getGuildFromDB(member.guild.id);

    if (doesGuildExist) {
      const logChannel = guild.channels.cache.get(logChannelId);

      const logEmbed = embedMessageFailureColorWithFields(
        "Member left",
        `<@${member.user.id}> has left the server.`,
        [
          { name: "Username", value: `${member.user.username}` || "Unknown" },
          { name: "User Id", value: `${member.user.id}` || "Unknown" },
        ]
      );

      await logChannel.send({ embeds: [logEmbed] });
    }
  } catch (error) {
    console.error(`Failed to send log info to target channel: ${error}`);
  }
};
