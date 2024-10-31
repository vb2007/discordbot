const db = require("../../../helpers/db");
const { embedMessagePrimaryColor } = require("../../../helpers/embeds/embed-message");

module.exports = {
    async sendMessageToDestinationChannel(client, message) {
        // const serverId = message.guild.id;
        // const channelId = message.channel.id;
        const messageContent = message.content;
        const senderUserName = message.author.username;
        const senderUserId = message.author.id;
        const serverName = message.guild.name;
        // const channelName = message.channel.name;

        try {
            const query = await db.query("SELECT sourceChannelId, destinationChannelId, destinationGuildId FROM configBridging");
            const sourceChannelId = query[0]?.sourceChannelId || null;
            const destinationChannelId = query[0]?.destinationChannelId || null;
            const destinationGuildId = query[0]?.destinationGuildId || null;

            if (sourceChannelId == message.channel.id) {
                const destinationChannel = await client.channels.fetch(destinationChannelId);
                // const destinationChannel = await destinationGuild.channels.cache.get(destinationChannelId);

                await destinationChannel.send("lol");
            }
        }
        catch (error) {
            console.error(`Failed to bridge message: ${error}`);
        }
    }
}