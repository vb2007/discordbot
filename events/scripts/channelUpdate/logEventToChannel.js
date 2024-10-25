const db = require("../../../helpers/db");
const { embedMessageSuccessColor } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfoNSFW(oldChannel, newChannel) {
        const doesGuildExist = await this.getGuildFromDB(newChannel);

        try {
            const query = await db.query("SELECT guildId, logChannelId FROM configLogging WHERE guildId = ?", [guildId]);
            const existingGuildId = query[0]?.guildId;

            if (existingGuildId) {
                const logChannelId = query[0]?.logChannelId;
                const logChannel = channel.guild.channels.cache.get(logChannelId);

                const nsfwStatus = channel.nsfw ? "NSFW" : "Not NSFW";
                const logEmbed = embedMessageSuccessColor(
                    "Channel updated",
                    `NSFW status was set to **${nsfwStatus}** in ${channel.name}.`,
                );

                await logChannel.send({ embeds: [logEmbed] });
            }
        }
        catch (error) {
            console.error(`Failed to send log info to target channel: ${error}`);
        }
    },

    async sendLogInfoName(oldChannel, newChannel) {
        console.log("");
    }
}