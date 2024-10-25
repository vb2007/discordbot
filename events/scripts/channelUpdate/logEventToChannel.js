const db = require("../../../helpers/db");
const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageSuccessColor } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfoNSFW(oldChannel, newChannel) {
        try {
            const { doesGuildExist, logChannelId } = await getGuildFromDB(oldChannel);

            if (doesGuildExist) {
                if (oldChannel.nsfw !== newChannel.nsfw) {
                    const logChannel = oldChannel.guild.channels.cache.get(logChannelId);
                
                    const oldNSFWStatus = oldChannel.nsfw ? "NSFW" : "Not NSFW";
                    const newNSFWStatus = newChannel.nsfw ? "NSFW" : "Not NSFW";
                    const logEmbed = embedMessageSuccessColor(
                        "Channel updated",
                        `NSFW status was set to **${newNSFWStatus}** from **${oldNSFWStatus}** in ${oldChannel.name}.`,
                    );
    
                    await logChannel.send({ embeds: [logEmbed] });
                }
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