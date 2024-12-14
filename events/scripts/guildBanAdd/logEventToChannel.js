const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageFailureColorWithFields } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(client, member, reason) {
        try {
            const guild = await client.guilds.fetch(message.guildId);
            const { doesGuildExist, logChannelId } = await getGuildFromDB(member.guildId);

            if (doesGuildExist) {
                const logChannel = guild.channels.cache.get(logChannelId);
                
                const logEmbed = embedMessageFailureColorWithFields(
                    "Member banned",
                    `<@${member.user.id}> was banned from the server.`,
                    [
                        { name: "Username", value: `${member.user.username}`|| "Unknown", inline: true },
                        { name: "User Id", value: `${member.user.id}`|| "Unknown", inline: true },
                        { name: "Reason", value: `${reason}`|| "Unknown" },
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