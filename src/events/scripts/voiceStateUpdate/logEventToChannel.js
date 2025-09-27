const { getGuildFromDB } = require("../../../helpers/log-data-query");
const {
  embedMessageFailureColor,
  embedMessageSuccessColor,
  embedMessageSuccessSecondaryColor,
  embedMessageSuccessSecondaryColorWithFields,
} = require("../../../helpers/embeds/embed-message");

module.exports = {
  async sendLogInfo(client, oldState, newState) {
    try {
      const { doesGuildExist, logChannelId } = await getGuildFromDB(oldState.guild.id);

      if (doesGuildExist) {
        const logChannel = oldState.guild.channels.cache.get(logChannelId);

        if (oldState.channel === null) {
          const logEmbed = embedMessageSuccessColor(
            "Voice state updated",
            `<@${oldState.member.id}> has **joined** to <#${newState.channel.id}>.`
          );

          return await logChannel.send({ embeds: [logEmbed] });
        }

        if (newState.channel === null) {
          const logEmbed = embedMessageFailureColor(
            "Voice state updated",
            `<@${oldState.member.id}> has **left** from <#${oldState.channel.id}>.`
          );

          return await logChannel.send({ embeds: [logEmbed] });
        }

        if (oldState.channel.id !== newState.channel.id) {
          const logEmbed = embedMessageSuccessSecondaryColorWithFields(
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

          return await logChannel.send({ embeds: [logEmbed] });
        }

        if (oldState.selfMute !== newState.selfMute) {
          const logEmbed = embedMessageSuccessSecondaryColor(
            "Voice state updated",
            `<@${oldState.member?.id || newState.member?.id}> has ${newState.selfMute ? "**muted**" : "**unmuted**"} themselves ${newState.channel ? `in <#${newState.channel.id}>` : ""}.`
          );

          await logChannel.send({ embeds: [logEmbed] });
        }

        if (oldState.selfDeaf !== newState.selfDeaf) {
          const logEmbed = embedMessageSuccessSecondaryColor(
            "Voice state updated",
            `<@${oldState.member?.id || newState.member?.id}> has ${newState.selfDeaf ? "**deafened**" : "**undeafened**"} themselves ${newState.channel ? `in <#${newState.channel.id}>` : ""}.`
          );

          await logChannel.send({ embeds: [logEmbed] });
        }
      }
    } catch (error) {
      console.error(`Failed to send log info to target channel: ${error.stack}`);
    }
  },
};
