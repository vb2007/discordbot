import { query } from "../../../helpers/db.js";
import { embedMessageWithServerIcon } from "../../../helpers/embeds/embed-message.js";
import { embedColors } from "../../../../config.json" with { type: "json" };

export const sendWelcomeMessage = async (member) => {
  const guildId = member.guild.id;
  const serverName = member.guild.name;
  const memberCount = member.guild.memberCount;
  const userTag = member.user.tag;
  const userId = member.user.id;

  try {
    const rows = await query(
      "SELECT channelId, message, isEmbed, embedColor FROM configWelcome WHERE guildId = ?",
      [guildId]
    );
    const channelId = rows[0]?.channelId;
    let message = rows[0]?.message;
    const isEmbed = rows[0]?.isEmbed;
    const embedColor = rows[0]?.embedColor || embedColors.primary;

    if (channelId && message) {
      const channel = member.guild.channels.cache.get(channelId);
      if (channel) {
        message = message
          .replace("{user}", `<@${userId}>`)
          .replace("{server}", serverName)
          .replace("{memberCount}", memberCount);

        if (isEmbed) {
          const embedContent = embedMessageWithServerIcon(
            embedColor,
            "Welcome!",
            message,
            member.guild
          );

          await channel.send({ embeds: [embedContent] });
        } else {
          await channel.send(message);
        }

        console.log(`Sent welcome message to ${userTag} in ${serverName}.`);
      }
    }
  } catch (error) {
    console.error(`Failed to display welcome message: ${error}`);
  }
};
