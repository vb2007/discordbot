const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageSuccessColor } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(channel) {
        try {
            const { doesGuildExist, logChannelId } = await getGuildFromDB(channel);

            if (doesGuildExist) {
                const logChannel = channel.guild.channels.cache.get(logChannelId);

                const logEmbed = embedMessageSuccessColor(
                    "Channel created",
                    `${channel.name} channel was created.`,
                );

                await logChannel.send({ embeds: [logEmbed] });
            }
        }
        catch (error) {
            console.error(`Failed to send log info to target channel: ${error}`);
        }
    }
}