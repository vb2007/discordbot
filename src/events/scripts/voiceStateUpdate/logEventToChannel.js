const { getGuildFromDB } = require("../../../helpers/log-data-query");
const {
  embedMessageFailureColor,
  embedMessageFailureColorWithFields,
} = require("../../../helpers/embeds/embed-message");

module.exports = {
  async sendLogInfo(client, oldState, newState) {
    try {
      const { doesGuildExist, logChannelId } = await getGuildFromDB(oldState.guild.id);

      if (doesGuildExist) {
        const logChannel = oldState.guild.channels.cache.get(logChannelId);

        if (oldState.voiceChannel !== newState.voiceChannel) {
          const logEmbed = embedMessageFailureColorWithFields(
            "Voice state updated",
            `A member has switched channels.`,
            [
              { name: "Member", value: `<@${oldState.member.id}>` },
              {
                name: "From",
                value: oldState.channel ? `<#${oldState.channel.id}>` : "None",
                inline: true,
              },
              {
                name: "To",
                value: newState.channel ? `<#${newState.channel.id}>` : "None",
                inline: true,
              },
            ]
          );

          await logChannel.send({ embeds: [logEmbed] });
        }

        if (oldState.selfMute !== newState.selfMute) {
          const logEmbed = embedMessageFailureColor(
            "Voice state updated",
            `<@${oldState.member.id}> has **muted** themselves in <#${newState.channel.id}>"".`
          );

          await logChannel.send({ embeds: [logEmbed] });
        }

        if (oldState.selfDeaf !== newState.selfDeaf) {
          const logEmbed = embedMessageFailureColor(
            "Voice state updated",
            `<@${oldState.member.id}> has **deafened** themselves in <#${newState.channel.id}>.`
          );

          await logChannel.send({ embeds: [logEmbed] });
        }
      }
    } catch (error) {
      console.error(`Failed to send log info to target channel: ${error}`);
    }
  },
};
