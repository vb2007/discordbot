const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageSuccessColorWithFields } = require("../../../helpers/embeds/embed-message");

module.exports = {
  async sendLogInfo(client, member) {
    try {
      const guild = await client.guilds.fetch(member.guild.id);
      const { doesGuildExist, logChannelId } = await getGuildFromDB(member.guild.id);

      if (doesGuildExist) {
        const logChannel = guild.channels.cache.get(logChannelId);

        const logEmbed = embedMessageSuccessColorWithFields(
          "Member joined",
          `<@${member.user.id}> joined the server.`,
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
  },
};
