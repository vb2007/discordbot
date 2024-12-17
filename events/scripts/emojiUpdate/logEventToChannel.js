const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageSuccessSecondaryColorWithFields } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(client, oldEmoji, newEmoji) {
        try {
            const guild = await client.guilds.fetch(oldEmoji.guild.id);
            const { doesGuildExist, logChannelId } = await getGuildFromDB(oldEmoji.guild.id);

            if (doesGuildExist) {
                const logChannel = guild.channels.cache.get(logChannelId);

                const logEmbed = embedMessageSuccessSecondaryColorWithFields(
                    "Emoji updated",
                    `${oldEmoji.name} emoji was updated.`,
                    [
                        { name: "Emoji Id", value: `${oldEmoji.id}`|| "Unknown", inline: true },
                        { name: "Animated?", value: `${oldEmoji.animated ? "Yes" : "No"}`|| "Unknown", inline: true },
                        { name: "Old name", value: `${oldEmoji.name}`|| "Unknown" },
                        { name: "New name", value: `${newEmoji.name}`|| "Unknown" },
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