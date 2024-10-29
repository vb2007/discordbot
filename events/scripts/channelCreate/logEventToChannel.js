const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { getChannelType } = require("../../../helpers/channel-types");
const { embedMessageSuccessColorWithFields } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(channel) {
        try {
            const { doesGuildExist, logChannelId } = await getGuildFromDB(channel);

            if (doesGuildExist) {
                const logChannel = channel.guild.channels.cache.get(logChannelId);

                const logEmbed = embedMessageSuccessColorWithFields(
                    "Channel created",
                    `Channel '<#${channel.id}>' was created.`,
                    [
                        { name: "Name", value: `${channel.name}`, inline: true },
                        { name: "Id", value: `${channel.id}`, inline: true },
                        { name: "Category", value: `${channel.parent.name}` },
                        { name: "Type", value: `${getChannelType(channel)}`, inline: true },
                        { name: "NSFW?", value: `${channel.nsfw ? "Yes" : "No"}`, inline: true },
                    ]
                );

                await logChannel.send({ embeds: [logEmbed] });
            }
        }
        catch (error) {
            console.error(`Failed to send log info to target channel: ${error}`);
        }
    }
}