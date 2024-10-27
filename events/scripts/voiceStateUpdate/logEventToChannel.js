const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageFailureColor } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(oldState, newState) {
        try {
            const { doesGuildExist, logChannelId } = await getGuildFromDB(oldState);


            const logEmbed = embedMessageFailureColor(
                "Voice state updated",
                `${oldState} \n ${newState}.`,
            );

            await logChannel.send({ embeds: [logEmbed] });

            if (doesGuildExist) {
                const logChannel = oldState.guild.channels.cache.get(logChannelId);
                
                const logEmbed = embedMessageFailureColor(
                    "Voice state updated",
                    `${oldState} \n ${newState}.`,
                );

                await logChannel.send({ embeds: [logEmbed] });

                if (oldState.voiceChannel !== newState.voiceChannel) {
                    const logEmbed = embedMessageFailureColor(
                        "Voice state updated",
                        `<@${oldState.member.id}> has moved from <#${oldState.voiceChannel}> to <#${newState.voiceChannel}>.`,
                    );

                    await logChannel.send({ embeds: [logEmbed] });
                }

                if (oldState.selfMute !== newState.selfMute) {
                    const logEmbed = embedMessageFailureColor(
                        "Voice state updated",
                        `<@${oldState.member.id}> has muted themselves in <#${newState.channel.id}>.`,
                    );

                    await logChannel.send({ embeds: [logEmbed] });
                }

                if (oldState.selfDeaf !== newState.selfDeaf) {
                    const logEmbed = embedMessageFailureColor(
                        "Voice state updated",
                        `<@${oldState.member.id}> has deafened themselves in <#${newState.channel.id}>.`,
                    );

                    await logChannel.send({ embeds: [logEmbed] });
                }
            }
        }
        catch(error) {
            console.error(`Failed to send log info to target channel: ${error}`);
        }
    }
}