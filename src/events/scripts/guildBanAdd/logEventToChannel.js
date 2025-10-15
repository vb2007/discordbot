import { getGuildFromDB } from "../../../helpers/log-data-query.js";
import { embedMessageFailureColorWithFields } from "../../../helpers/embeds/embed-message.js";

export const sendLogInfo = async (client, ban) => {
  try {
    const guild = await client.guilds.fetch(ban.guild.id);
    const { doesGuildExist, logChannelId } = await getGuildFromDB(ban.guild.id);

    if (doesGuildExist) {
      const logChannel = guild.channels.cache.get(logChannelId);

      const logEmbed = embedMessageFailureColorWithFields(
        "Member banned",
        `<@${ban.user.id}> was banned from the server.`,
        [
          { name: "Username", value: ban.user.username || "Unknown", inline: false },
          { name: "User Id", value: ban.user.id || "Unknown", inline: false },
          //the reason isn't in the ban object for some reason
          //{ name: "Reason", value: `${ban.reason}` || "Unknown" },
        ]
      );

      await logChannel.send({ embeds: [logEmbed] });
    }
  } catch (error) {
    console.error(`Failed to send log info to target channel: ${error}`);
  }
};
