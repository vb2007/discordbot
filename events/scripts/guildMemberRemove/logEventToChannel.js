const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageFailureColor } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(member) {
        try {
            const { doesGuildExist, logChannelId } = await getGuildFromDB(member);

            if (doesGuildExist) {
                const logChannel = member.guild.channels.cache.get(logChannelId);
                
                const logEmbed = embedMessageFailureColor(
                    "Member left",
                    `<@${member.user.id}> has left the server.`,
                );

                await logChannel.send({ embeds: [logEmbed] });
            }
        }
        catch(error) {
            console.error(`Failed to send log info to target channel: ${error}`);
        }
    }
}