const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageSuccessColor } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(member) {
        try {
            const { doesGuildExist, logChannelId } = await getGuildFromDB(member);

            if (existingGuildId) {
                const logChannel = oldChannel.guild.channels.cache.get(logChannelId);

                const logEmbed = embedMessageSuccessColor(
                    "Member joined",
                    `${member.user.tag} joined the server.`,
                );

                await logChannel.send({ embeds: [logEmbed] });
            }
        }
        catch (error) {
            console.error(`Failed to send log info to target channel: ${error}`);
        }
    }
}