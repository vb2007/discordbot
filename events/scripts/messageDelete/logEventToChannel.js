const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageFailureColorWithFields } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(message) {
        try {
            console.log(message);
            const doesGuildExist = true;
            const logChannelId = "669982904058773515";
            // const { doesGuildExist, logChannelId } = await getGuildFromDB(message);
            console.log(doesGuildExist, logChannelId);

            // if (doesGuildExist) {
                const logChannel = message.guild.channels.cache.get(logChannelId);
                
                const logEmbed = embedMessageFailureColorWithFields(
                    "Message deleted",
                    "A message was deleted.",
                    [
                        { name: "Content", value: `${message.content}` },
                        { name: "Channel", value: `<#${message.channel.id}>` },
                        { name: "Author", value: `<@${message.author.id}>` },
                        { name: "Message Id", value: `${message.id}`, inline: true },
                        { name: "Channel Id", value: `${message.channel.id}`, inline: true },
                        { name: "Author Id", value: `${message.author.id}`, inline: true },
                        { name: "Author Username", value: `${message.author.username}`, inline: true },
                    ]
                );

                await logChannel.send({ embeds: [logEmbed] });
            // }
        }
        catch(error) {
            console.error(`Failed to send log info to target channel: ${error.stack}`);
        }
    }
}