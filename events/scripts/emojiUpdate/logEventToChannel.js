const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageSuccessColor } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(oldEmoji, newEmoji) {
        try {
            const { doesGuildExist, logChannelId } = await getGuildFromDB(oldEmoji);

            if (doesGuildExist) {
                const logChannel = oldEmoji.guild.channels.cache.get(logChannelId);

                const logEmbed = embedMessageSuccessColor(
                    "Emoji updated",
                    `${oldEmoji.name} emoji was updated.\n\nOld name: ${oldEmoji.name}\nNew name: ${newEmoji.name}`,
                );

                await logChannel.send({ embeds: [logEmbed] });
            }
        }
        catch (error) {
            console.error(`Failed to send log info to target channel: ${error}`);
        }
    }
}