const db = require("../../../helpers/db");
const { embedMessageSuccessColor } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(emoji) {
        const guildId = emoji.guild.id;

        try {
            const query = await db.query("SELECT guildId, logChannelId FROM configLogging WHERE guildId = ?", [guildId]);
            const existingGuildId = query[0]?.guildId;

            if (existingGuildId) {
                const logChannelId = query[0]?.logChannelId;
                const logChannel = channel.guild.channels.cache.get(logChannelId);

                const logEmbed = embedMessageSuccessColor(
                    "Emoji created",
                    `${emoji.name} emoji was created.`,
                );

                await logChannel.send({ embeds: [logEmbed] });
            }
        }
        catch (error) {
            console.error(`Failed to send log info to target channel: ${error}`);
        }
    }
}