const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageFailureColor } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(emoji) {
        try {
            const { doesGuildExist, logChannelId } = await getGuildFromDB(emoji);

            if (doesGuildExist) {
                const logChannel = emoji.guild.channels.cache.get(logChannelId);

                const logEmbed = embedMessageFailureColor(
                    "Emoji deleted",
                    `${emoji.name} emoji was deleted.`,
                );

                await logChannel.send({ embeds: [logEmbed] });
            }
        }
        catch (error) {
            console.error(`Failed to send log info to target channel: ${error}`);
        }
    }
}