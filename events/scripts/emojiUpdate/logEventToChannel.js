const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageSuccessSecondaryColorWithFields } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(oldEmoji, newEmoji) {
        try {
            const { doesGuildExist, logChannelId } = await getGuildFromDB(oldEmoji);

            if (doesGuildExist) {
                const logChannel = oldEmoji.guild.channels.cache.get(logChannelId);

                const logEmbed = embedMessageSuccessSecondaryColorWithFields(
                    "Emoji updated",
                    `${oldEmoji.name} emoji was updated.`,
                    [
                        { name: "Emoji Id", value: `${oldEmoji.id}`, inline: true },
                        { name: "Animated?", value: `${oldEmoji.animated ? "Yes" : "No"}`, inline: true },
                        { name: "Old name", value: `${oldEmoji.name}` },
                        { name: "New name", value: `${newEmoji.name}` },
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