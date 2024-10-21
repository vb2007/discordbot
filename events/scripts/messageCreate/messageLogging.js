const db = require("../../../helpers/db");
const { logMessagesToLocalDatabase } = require("../../../config.json");

module.exports = {
    async logMessagesToLocalDatabase(message) {
        if (logMessagesToLocalDatabase == "True") {
            const messageContent = message.content;
            const senderUserName = message.author.username;
            const senderUserId = message.author.id;
            const serverName = message.guild.name;
            const serverId = message.guild.id;
            const channelName = message.channel.name;
            const channelId = message.channel.id;

            try {
                await db.query("INSERT INTO messageLog (messageContent, senderUserName, senderUserId, serverName, serverId, channelName, channelId) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [
                        messageContent, senderUserName, senderUserId, serverName, serverId, channelName, channelId
                    ]
                );
                console.log(`Logged message "${message.content}" from ${senderUserName} in ${serverName}.`);
            }
            catch (error) {
                console.error(`Failed to log message: ${error}`);
            }
        }
    }
}