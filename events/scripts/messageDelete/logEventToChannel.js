const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageFailureColorWithFields } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(message) {
        try {
            const { doesGuildExist, logChannelId } = await getGuildFromDB(message);

            if (doesGuildExist) {
                const logChannel = message.guild.channels.cache.get(logChannelId);
                
                const logEmbed = embedMessageFailureColorWithFields(
                    "Message deleted",
                    "A message was deleted.",
                    [
                        { name: "Content", value: `${message.content}` },
                        { name: "Channel", value: `<#${message.channel.id}>` },
                        { name: "Author", value: `<@${message.author.id}>` },
                        { name: "Message Id", value: `${message.id}`, inline: true },
                        { name: "Channel Id", value: `${oldMessage.channel.id}`, inline: true },
                        { name: "Author Id", value: `${message.author.id}`, inline: true },
                        { name: "Author Username", value: `${message.author.username}`, inline: true },
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