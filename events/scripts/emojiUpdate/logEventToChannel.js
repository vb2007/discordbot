const db = require("../../../helpers/db");
const { embedMessageSuccessColor } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(oldEmoji, newEmoji) {
        const guildId = oldEmoji.guild.id;

        try {
            const query = await db.query("SELECT guildId, logChannelId FROM configLogging WHERE guildId = ?", [guildId]);
            const existingGuildId = query[0]?.guildId;

            if (existingGuildId) {
                const logChannelId = query[0]?.logChannelId;
                const logChannel = oldEmoji.guild.channels.cache.get(logChannelId);

                const logEmbed = embedMessageSuccessColor(
                    "Emoji updated",
                    `${oldEmoji.name} emoji was updated.\n\nOld name: ${oldEmoji.name}\nNew name: ${newEmoji.name}`,
                );

                await logChannel.send({ embeds: [logEmbed] });
            }
        }
        catch (error) {
            console.error(`Failed to send log info to target channel: ${error}`);
        }
    }
}