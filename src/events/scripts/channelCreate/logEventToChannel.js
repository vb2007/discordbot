const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { getChannelType } = require("../../../helpers/channel-types");
const { embedMessageSuccessColorWithFields } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(client, channel) {
        try {
            const guild = await client.guilds.fetch(channel.guildId);
            const { doesGuildExist, logChannelId } = await getGuildFromDB(channel.guildId);

            if (doesGuildExist) {
                const logChannel = guild.channels.cache.get(logChannelId);

                const logEmbed = embedMessageSuccessColorWithFields(
                    "Channel created",
                    `Channel '<#${channel.id}>' was created.`,
                    [
                        { name: "Name", value: `${channel.name}` || "Unknown", inline: true },
                        { name: "Id", value: `${channel.id}` || "Unknown", inline: true },
                        { name: "Category", value: `${channel.parent.name}` || "Unknown" },
                        { name: "Type", value: `${getChannelType(channel)}` || "Unknown", inline: true },
                        { name: "NSFW?", value: `${channel.nsfw ? "Yes" : "No"}` || "Unknown", inline: true },
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