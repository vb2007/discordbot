const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessagePrimaryColor } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(channel) {
        try {
            const { doesGuildExist, logChannelId } = await getGuildFromDB(channel);

            if (doesGuildExist) {
                const logChannel = channel.guild.channels.cache.get(logChannelId);

                const logEmbed = embedMessagePrimaryColor(
                    "Channel pins updated",
                    `${channel.name} channel pins were updated.`,
                );

                await logChannel.send({ embeds: [logEmbed] });
            }
        }
        catch (error) {
            console.error(`Failed to send message pin log info to target channel: ${error}`);
        }
    }
}