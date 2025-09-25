const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageFailureColorWithFields } = require("../../../helpers/embeds/embed-message");

module.exports = {
  async sendLogInfo(client, emoji) {
    try {
      const guild = await client.guilds.fetch(emoji.guild.id);
      const { doesGuildExist, logChannelId } = await getGuildFromDB(emoji.guild.id);

      if (doesGuildExist) {
        const logChannel = guild.channels.cache.get(logChannelId);

        const logEmbed = embedMessageFailureColorWithFields(
          "Emoji deleted",
          `Emoji '${emoji.name}' was deleted.`,
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
  },
};
