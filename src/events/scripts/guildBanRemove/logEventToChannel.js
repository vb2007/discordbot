const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageSuccessColorWithFields } = require("../../../helpers/embeds/embed-message");

module.exports = {
  async sendLogInfo(client, unban) {
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
  },
};
