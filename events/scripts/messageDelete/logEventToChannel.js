const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageFailureColorWithFields } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(client, message) {
        try {
            const guild = await client.guilds.fetch(message.guildId);
            const { doesGuildExist, logChannelId } = await getGuildFromDB(message.guildId);

            if (doesGuildExist) {
                const logChannel = guild.channels.cache.get(logChannelId);
                
                const logEmbed = embedMessageFailureColorWithFields(
                    "Message deleted",
                    "A message was deleted.",
                    [
                        { name: "Content", value: message.content || 'No content available' },
                        { name: "Channel", value: `<#${message.channelId}>` },
                        { name: "Author", value: message.author ? `<@${message.author.id}>` : 'Unknown' },
                        { name: "Message Id", value: message.id || 'Unknown', inline: true },
                        { name: "Channel Id", value: message.channelId || 'Unknown', inline: true },
                        { name: "Author Id", value: message.author?.id || 'Unknown', inline: true },
                        { name: "Author Username", value: message.author?.username || 'Unknown', inline: true },
                    ]
                );

                await logChannel.send({ embeds: [logEmbed] });
            }
        }
        catch(error) {
            console.error(`Failed to send log info to target channel: ${error.stack}`);
        }
    }
}