const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageFailureColor } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(message) {
        try {
            const { doesGuildExist, logChannelId } = await getGuildFromDB(message);

            if (doesGuildExist) {
                const logChannel = message.guild.channels.cache.get(logChannelId);
                
                const logEmbed = embedMessageFailureColor(
                    "Message deleted",
                    `Message "**${message.content}**" from <@${message.author.id}> has been deleted from <#${message.channel.id}>.`,
                );

                await logChannel.send({ embeds: [logEmbed] });
            }
        }
        catch(error) {
            console.error(`Failed to send log info to target channel: ${error}`);
        }
    }
}