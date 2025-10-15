import { getGuildFromDB } from "../../../helpers/log-data-query.js";
import { embedMessageSuccessColorWithFields } from "../../../helpers/embeds/embed-message.js";

export const sendLogInfo = async (client, emoji) => {
  try {
    const guild = await client.guilds.fetch(emoji.guild.id);
    const { doesGuildExist, logChannelId } = await getGuildFromDB(emoji.guild.id);

    if (doesGuildExist) {
      const logChannel = guild.channels.cache.get(logChannelId);

      const logEmbed = embedMessageSuccessColorWithFields(
        "Emoji created",
        `Emoji '<:${emoji.name}:${emoji.id}>' was created.`,
        [
          { name: "Emoji name", value: `${emoji.name}` || "Unknown" },
          { name: "Emoji Id", value: `${emoji.id}` || "Unknown" },
          { name: "Animated?", value: `${emoji.animated ? "Yes" : "No"}` || "Unknown" },
        ]
      );

      await logChannel.send({ embeds: [logEmbed] });
    }
  } catch (error) {
    console.error(`Failed to send log info to target channel: ${error}`);
  }
};
