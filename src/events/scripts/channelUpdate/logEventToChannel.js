import { getGuildFromDB } from "../../../helpers/log-data-query.js";
import { embedMessageSuccessSecondaryColorWithFields } from "../../../helpers/embeds/embed-message.js";

export const sendLogInfo = async (client, oldChannel, newChannel) => {
  try {
    const guild = await client.guilds.fetch(oldChannel.guildId);
    const { doesGuildExist, logChannelId } = await getGuildFromDB(oldChannel.guildId);

    if (doesGuildExist) {
      const logChannel = guild.channels.cache.get(logChannelId);
      const changedChannelId = newChannel.id;

      if (oldChannel.nsfw !== newChannel.nsfw) {
        const logEmbed = embedMessageSuccessSecondaryColorWithFields(
          "Channel Updated: NSFW status",
          `Channel NSFW status was changed in <#${changedChannelId}>.`,
          [
            { name: "Channel name", value: `${newChannel.name}` || "Unknown", inline: true },
            { name: "Channel Id", value: `${changedChannelId}` || "Unknown", inline: true },
            { name: "From", value: `**${oldChannel.nsfw ? "NSFW" : "Not NSFW"}**` || "Unknown" },
            { name: "To", value: `**${newChannel.nsfw ? "NSFW" : "Not NSFW"}**` || "Unknown" },
          ]
        );

        await logChannel.send({ embeds: [logEmbed] });
      }

      if (oldChannel.name !== newChannel.name) {
        const logEmbed = embedMessageSuccessSecondaryColorWithFields(
          "Channel Updated: Name",
          `Channel name was changed in <#${changedChannelId}>.`,
          [
            { name: "Channel name", value: `${newChannel.name}` || "Unknown", inline: true },
            { name: "Channel Id", value: `${changedChannelId}` || "Unknown", inline: true },
            { name: "From", value: `**${oldChannel.name}**` || "Unknown" },
            { name: "To", value: `**${newChannel.name}**` || "Unknown" },
          ]
        );

        await logChannel.send({ embeds: [logEmbed] });
      }

      if (oldChannel.topic !== newChannel.topic) {
        const logEmbed = embedMessageSuccessSecondaryColorWithFields(
          "Channel Updated: Topic",
          `Channel topic *(description)* was changed in <#${changedChannelId}>.`,
          [
            { name: "Channel name", value: `${newChannel.name}` || "Unknown", inline: true },
            { name: "Channel Id", value: `${changedChannelId}` || "Unknown", inline: true },
            {
              name: "From",
              value:
                `**${oldChannel.topic == "" ? "*empty description*" : oldChannel.topic}**` ||
                "Unknown",
            },
            {
              name: "To",
              value:
                `**${newChannel.topic == "" ? "*empty description*" : newChannel.topic}**` ||
                "Unknown",
            },
          ]
        );

        await logChannel.send({ embeds: [logEmbed] });
      }

      if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
        const logEmbed = embedMessageSuccessSecondaryColorWithFields(
          "Channel Updated: Slowmode",
          `Channel slowmode was changed in <#${changedChannelId}>.`,
          [
            { name: "Channel name", value: `${newChannel.name}` || "Unknown", inline: true },
            { name: "Channel Id", value: `${changedChannelId}` || "Unknown", inline: true },
            { name: "From", value: `**${oldChannel.rateLimitPerUser} seconds**` || "Unknown" },
            { name: "To", value: `**${newChannel.rateLimitPerUser} seconds**` || "Unknown" },
          ]
        );

        await logChannel.send({ embeds: [logEmbed] });
      }
    }
  } catch (error) {
    console.error(`Failed to send log info to target channel: ${error}`);
  }
};
