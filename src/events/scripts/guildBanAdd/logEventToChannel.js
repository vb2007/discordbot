const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageFailureColorWithFields } = require("../../../helpers/embeds/embed-message");

module.exports = {
  async sendLogInfo(client, ban) {
    try {
      const guild = await client.guilds.fetch(ban.guild.id);
      const { doesGuildExist, logChannelId } = await getGuildFromDB(ban.guild.id);

      if (doesGuildExist) {
        const logChannel = guild.channels.cache.get(logChannelId);

        const logEmbed = embedMessageFailureColorWithFields(
          "Member banned",
          `<@${ban.user.id}> was banned from the server.`,
          [
            { name: "Username", value: `${ban.user.username}` || "Unknown", inline: true },
            { name: "User Id", value: `${ban.user.id}` || "Unknown", inline: true },
            { name: "Reason", value: `${ban.reason}` || "Unknown" },
          ]
        );

        await logChannel.send({ embeds: [logEmbed] });
      }
    } catch (error) {
      console.error(`Failed to send log info to target channel: ${error}`);
    }
  },
};
