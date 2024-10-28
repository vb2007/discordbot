const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageSuccessSecondaryColor } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(channel) {
        try {
            const { doesGuildExist, logChannelId } = await getGuildFromDB(channel);

            if (doesGuildExist) {
                const logChannel = channel.guild.channels.cache.get(logChannelId);

                const logEmbed = embedMessageSuccessSecondaryColor(
                    "Channel pins updated",
                    `The channel pins were updated in <#${channel.id}>.`,
                );

                await logChannel.send({ embeds: [logEmbed] });
            }
        }
        catch (error) {
            console.error(`Failed to send message pin log info to target channel: ${error}`);
        }
    }
}