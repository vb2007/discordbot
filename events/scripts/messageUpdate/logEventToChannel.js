const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageWarningColorWithFields } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(oldMessage, newMessage) {
        try {
            const { doesGuildExist, logChannelId } = await getGuildFromDB(oldMessage);

            if (doesGuildExist) {
                const logChannel = oldMessage.guild.channels.cache.get(logChannelId);
                
                const logEmbed = embedMessageWarningColorWithFields(
                    "Message updated",
                    `A message was updated.`,
                    [
                        { name: "From", value: `${oldMessage.content}` },
                        { name: "To", value: `${newMessage.content}` },
                        { name: "Channel", value: `<#${oldMessage.channel.id}>` },
                        { name: "Author", value: `<@${oldMessage.author.id}>` },
                        { name: "Message Id", value: `${oldMessage.id}`, inline: true },
                        { name: "Channel Id", value: `${oldMessage.channel.id}`, inline: true },
                        { name: "Author Id", value: `${oldMessage.author.id}`, inline: true },
                        { name: "Author Username", value: `${oldMessage.author.username}`, inline: true },
                    ]
                );

                await logChannel.send({ embeds: [logEmbed] });
            }
        }
        catch(error) {
            console.error(`Failed to send log info to target channel: ${error}`);
        }
    }
}