const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageFailureColorWithFields } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(member, reason) {
        try {
            const { doesGuildExist, logChannelId } = await getGuildFromDB(member);

            if (doesGuildExist) {
                const logChannel = member.guild.channels.cache.get(logChannelId);
                
                const logEmbed = embedMessageFailureColorWithFields(
                    "Member banned",
                    `<@${member.user.id}> was banned from the server.`,
                    [
                        { name: "Username", value: `${member.user.username}`, inline: true },
                        { name: "User Id", value: `${member.user.id}`, inline: true },
                        { name: "Reason", value: `${reason}` },
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