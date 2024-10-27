const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageSuccessSecondaryColor } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(oldChannel, newChannel) {
        try {
            const { doesGuildExist, logChannelId } = await getGuildFromDB(oldChannel);

            if (doesGuildExist) {
                const logChannel = oldChannel.guild.channels.cache.get(logChannelId);
                const changedChannelId = newChannel.id;

                if (oldChannel.nsfw !== newChannel.nsfw) {
                    const logEmbed = embedMessageSuccessSecondaryColor(
                        "Channel Updated: NSFW status",
                        `Channel NSFW status was changed to "**${newChannel.nsfw ? "NSFW" : "Not NSFW"}**" from "**${oldChannel.nsfw ? "NSFW" : "Not NSFW"}**" in <#${changedChannelId}>.`,
                    );
    
                    await logChannel.send({ embeds: [logEmbed] });
                }

                if (oldChannel.name !== newChannel.name) {
                    const logEmbed = embedMessageSuccessSecondaryColor(
                        "Channel Updated: Name",
                        `Channel name was changed to "**${newChannel.name}**" from "**${oldChannel.name}**" in <#${changedChannelId}>.`,
                    );
    
                    await logChannel.send({ embeds: [logEmbed] });
                }

                if (oldChannel.topic !== newChannel.topic) {
                    const logEmbed = embedMessageSuccessSecondaryColor(
                        "Channel Updated: Topic",
                        `Channel topic *(description)* was changed to "**${newChannel.topic == "" ? "*empty description*" : newChannel.topic}**" from "**${newChannel.topic == "" ? "*empty description*" : newChannel.topic}**" in <#${changedChannelId}>.`,
                    );
    
                    await logChannel.send({ embeds: [logEmbed] });
                }

                if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
                    const logEmbed = embedMessageSuccessSecondaryColor(
                        "Channel Updated: Slowmode",
                        `Channel slowmode was changed to "**${newChannel.rateLimitPerUser}**" seconds from "**${oldChannel.rateLimitPerUser}**" seconds in <#${changedChannelId}>.`,
                    );
    
                    await logChannel.send({ embeds: [logEmbed] });
                }
            }
        }
        catch (error) {
            console.error(`Failed to send log info to target channel: ${error}`);
        }
    }
}