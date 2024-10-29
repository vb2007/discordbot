const { getGuildFromDB } = require("../../../helpers/log-data-query");
const { embedMessageSuccessColorWithFields } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendLogInfo(emoji) {
        try {
            const { doesGuildExist, logChannelId } = await getGuildFromDB(emoji);

            if (doesGuildExist) {
                const logChannel = emoji.guild.channels.cache.get(logChannelId);

                const logEmbed = embedMessageSuccessColorWithFields(
                    "Emoji created",
                    `Emoji '<:${emoji.name}:${emoji.id}>' was created.`,
                    [
                        { name: "Emoji name", value: `${emoji.name}` },
                        { name: "Emoji Id", value: `${emoji.id}` },
                        { name: "Animated?", value: `${emoji.animated ? "Yes" : "No"}` },
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