const db = require("../../../helpers/db");

module.exports = {
    async sendWelcomeMessage(member) {
        const guildId = member.guild.id;
        const serverName = member.guild.name;
        const memberCount = member.guild.memberCount;
        const userTag = member.user.tag;
        const userId = member.user.id;

        try {
            const rows = await db.query("SELECT channelId, message FROM welcome WHERE guildId = ?", [guildId]);
            const channelId = rows[0]?.channelId;
            let message = rows[0]?.message;

            if (channelId && message) {
                const channel = member.guild.channels.cache.get(channelId);
                if (channel) {
                    message = message
                        .replace("{user}", `<@${userId}>`)
                        .replace("{server}", serverName)
                        .replace("{memberCount}", memberCount);
                    await channel.send(message);
                    console.log(`Sent welcome message to ${userTag} in ${serverName}.`);
                }
            }
        }
        catch (error) {
            console.error(`Failed to display welcome message: ${error}`);
        }
    }
};