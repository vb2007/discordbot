const db = require("../../../helpers/db");
const { embedMessageSuccessColor } = require("../../../helpers/embed-reply");

module.exports = {
    async sendLogInfo(channel) {
        const guildId = channel.guild.id;

        try {
            const query = await db.query("SELECT guildId, logChannelId FROM configLogging WHERE guildId = ?", [guildId]);
            const existingGuildId = query[0]?.guildId;

            if (existingGuildId) {
                const logChannelId = query[0]?.logChannelId;
                const channel = channel.guild.channels.cache.get(logChannelId);

                const logEmbed = embedMessageSuccessColor(
                    "Channel created",
                    `${channel.name} channel was created.`,
                );

                await logChannelId.send({ embeds: [logEmbed] });
            }
        }
        catch (error) {
            console.error(`Failed to send log info to target channel: ${error}`);
        }
    }
}