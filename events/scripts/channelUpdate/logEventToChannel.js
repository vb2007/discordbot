const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageSuccessSecondaryColorWithFields } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(oldChannel, newChannel) {
        try {
            const { doesGuildExist, logChannelId } = await getGuildFromDB(oldChannel);

            if (doesGuildExist) {
                const logChannel = oldChannel.guild.channels.cache.get(logChannelId);
                const changedChannelId = newChannel.id;

                if (oldChannel.nsfw !== newChannel.nsfw) {
                    const logEmbed = embedMessageSuccessSecondaryColorWithFields(
                        "Channel Updated: NSFW status",
                        `Channel NSFW status was changed in <#${changedChannelId}>.`,
                        [
                            { name: "Channel name", value: `${newChannel.name}`, inline: true },
                            { name: "Channel Id", value: `${changedChannelId}`, inline: true },
                            { name: "From", value: `**${oldChannel.nsfw ? "NSFW" : "Not NSFW"}**` },
                            { name: "To", value: `**${newChannel.nsfw ? "NSFW" : "Not NSFW"}**` },
                        ]
                    );
    
                    await logChannel.send({ embeds: [logEmbed] });
                }

                if (oldChannel.name !== newChannel.name) {
                    const logEmbed = embedMessageSuccessSecondaryColorWithFields(
                        "Channel Updated: Name",
                        `Channel name was changed in <#${changedChannelId}>.`,
                        [
                            { name: "Channel name", value: `${newChannel.name}`, inline: true },
                            { name: "Channel Id", value: `${changedChannelId}`, inline: true },
                            { name: "From", value: `**${oldChannel.name}**` },
                            { name: "To", value: `**${newChannel.name}**` },
                        ]
                    );
    
                    await logChannel.send({ embeds: [logEmbed] });
                }

                if (oldChannel.topic !== newChannel.topic) {
                    const logEmbed = embedMessageSuccessSecondaryColorWithFields(
                        "Channel Updated: Topic",
                        `Channel topic *(description)* was changed in <#${changedChannelId}>.`,
                        [
                            { name: "Channel name", value: `${newChannel.name}`, inline: true },
                            { name: "Channel Id", value: `${changedChannelId}`, inline: true },
                            { name: "From", value: `**${oldChannel.topic == "" ? "*empty description*" : oldChannel.topic}**` },
                            { name: "To", value: `**${newChannel.topic == "" ? "*empty description*" : newChannel.topic}**` },
                        ]
                    );
    
                    await logChannel.send({ embeds: [logEmbed] });
                }

                if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
                    const logEmbed = embedMessageSuccessSecondaryColorWithFields(
                        "Channel Updated: Slowmode",
                        `Channel slowmode was changed to "**${newChannel.rateLimitPerUser}**" seconds from "**${oldChannel.rateLimitPerUser}**" seconds in <#${changedChannelId}>.`,
                        [
                            { name: "Channel name", value: `${newChannel.name}`, inline: true },
                            { name: "Channel Id", value: `${changedChannelId}`, inline: true },
                            { name: "From", value: `**${oldChannel.rateLimitPerUser} seconds**` },
                            { name: "To", value: `**${newChannel.rateLimitPerUser} seconds**` },
                        ]
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