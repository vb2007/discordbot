const db = require("../../../helpers/db");
const { embedColors } = require("../../../../config.json");
const { embedMessageWithServerIcon } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendGoodbyeMessage(member) {
        const guildId = member.guild.id;
        const serverName = member.guild.name;
        const memberCount = member.guild.memberCount;
        const userTag = member.user.tag;
        // const userId = member.user.id;

        try {
            const rows = await db.query("SELECT channelId, message, isEmbed, embedColor FROM configGoodbye WHERE guildId = ?", [guildId]);
            const channelId = rows[0]?.channelId;
            let message = rows[0]?.message;
            const isEmbed = rows[0]?.isEmbed;
            const embedColor = rows[0]?.embedColor || embedColors.primary;

            if (channelId && message) {
                const channel = member.guild.channels.cache.get(channelId);
                if (channel) {
                    message = message
                        // .replace("{user}", `<@${userId}>`) //pinged users who've left the server are usually unaccessable due to discord's limitations
                        .replace("{user}", `**${userTag}**`)
                        .replace("{server}", serverName)
                        .replace("{memberCount}", memberCount);
                    
                    if (isEmbed) {
                        const embedContent = embedMessageWithServerIcon(
                            embedColor,
                            "Goodbye...",
                            message,
                            member.guild
                        );

                        await channel.send({ embeds: [embedContent] });
                    }
                    else {
                        await channel.send(message);
                    }
                    
                    console.log(`Sent goodbye message to ${userTag} in ${serverName}.`);
                }
            }
        }
        catch (error) {
            console.error(`Failed to display goodbye message: ${error}`);
        }
    }
};