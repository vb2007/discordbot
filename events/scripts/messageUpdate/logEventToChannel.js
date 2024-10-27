const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageWarningColor } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(oldMessage, newMessage) {
        try {
            const { doesGuildExist, logChannelId } = await getGuildFromDB(oldMessage);

            if (doesGuildExist) {
                const logChannel = oldMessage.guild.channels.cache.get(logChannelId);
                
                const logEmbed = embedMessageWarningColor(
                    "Message updated",
                    `Message "**${oldMessage.content}**" from <@${oldMessage.author.id}> has been updated to "**${newMessage.content}**" in <#${oldMessage.channel.id}>.`,
                );

                await logChannel.send({ embeds: [logEmbed] });
            }
        }
        catch(error) {
            console.error(`Failed to send log info to target channel: ${error}`);
        }
    }
}