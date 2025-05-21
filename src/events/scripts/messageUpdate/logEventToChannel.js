const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageWarningColorWithFields } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(client, oldMessage, newMessage) {
        try {
            const guild = await client.guilds.fetch(oldMessage.guildId);
            const { doesGuildExist, logChannelId } = await getGuildFromDB(oldMessage.guildId);

            if (doesGuildExist) {
                if (oldMessage.content !== newMessage.content) {
                    const logChannel = guild.channels.cache.get(logChannelId);
                
                    const logEmbed = embedMessageWarningColorWithFields(
                        "Message updated",
                        `A message was updated.`,
                        [
                            { name: "From", value: `${oldMessage.content}` || "Unknown" },
                            { name: "To", value: `${newMessage.content}` || "Unknown" },
                            { name: "Author", value: `<@${oldMessage.author.id}>` || "Unknown", inline: true },
                            { name: "Author Username", value: `${oldMessage.author.username}` || "Unknown", inline: true },
                            { name: "Channel", value: `<#${oldMessage.channel.id}>` || "Unknown" },
                            { name: "Message Id", value: `${oldMessage.id}` || "Unknown", inline: true },
                            { name: "Channel Id", value: `${oldMessage.channel.id}` || "Unknown", inline: true },
                            { name: "Author Id", value: `${oldMessage.author.id}` || "Unknown", inline: true },
                        ]
                    );
    
                    await logChannel.send({ embeds: [logEmbed] });
                }
            }
        }
        catch(error) {
            console.error(`Failed to send log info to target channel: ${error.stack}`);
        }
    }
}