const db = require("../../../helpers/db");
const { embedMessageFailureColor } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(channel) {
        const guildId = channel.guild.id;

        try {
            const query = await db.query("SELECT guildId, logChannelId FROM configLogging WHERE guildId = ?", [guildId]);
            const existingGuildId = query[0]?.guildId;

            if (existingGuildId) {
                const logChannelId = query[0]?.logChannelId;
                const logChannel = channel.guild.channels.cache.get(logChannelId);

                const logEmbed = embedMessageFailureColor(
                    "Channel deleted",
                    `${channel.name} channel was deleted.`,
                );

                await logChannel.send({ embeds: [logEmbed] });
            }
        }
        catch (error) {
            console.error(`Failed to send log info to target channel: ${error}`);
        }
    }
}