const db = require("../../../helpers/db");
const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageSuccessColor } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfoNSFW(oldChannel, newChannel) {
        try {
            const { doesGuildExist, logChannelId } = await getGuildFromDB(oldChannel);
            console.log(doesGuildExist, logChannelId);

            if (doesGuildExist) {
                const logChannel = oldChannel.guild.channels.cache.get(logChannelId);
                
                const nsfwStatus = oldChannel.nsfw ? "NSFW" : "Not NSFW";
                const logEmbed = embedMessageSuccessColor(
                    "Channel updated",
                    `NSFW status was set to **${nsfwStatus}** in ${oldChannel.name}.`,
                );

                await logChannel.send({ embeds: [logEmbed] });
            }
        }
        catch (error) {
            console.error(`Failed to send log info to target channel: ${error}`);
        }
    },

    // async sendLogInfoName(oldChannel, newChannel) {
    //     console.log("");
    // }
}