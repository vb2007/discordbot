const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageSuccessColorWithFields } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(member) {
        try {
            const { doesGuildExist, logChannelId } = await getGuildFromDB(member);

            if (doesGuildExist) {
                const logChannel = member.guild.channels.cache.get(logChannelId);

                const logEmbed = embedMessageFailureColorWithFields(
                    "Member unbanned",
                    `<@${member.user.id}> was unbanned from the server.`,
                    [
                        { name: "Username", value: `${member.user.username}` },
                        { name: "User Id", value: `${member.user.id}` },
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