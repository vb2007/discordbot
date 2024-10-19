const db = require("../../../helpers/db");

module.exports = {
    async logMessage(message) {
        const messageContent = message.content;
        const senderUserName = message.author.username;
        const senderUserId = message.author.id;
        const serverName = message.guild.name;
        const serverId = message.guild.id;
        const channelName = message.channel.name;
        const channelId = message.channel.id;

        try {
            await db.query("INSERT INTO messageLog (message, senderUserName, senderUserId, serverName, serverId, channelName, channelId) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [
                    messageContent, senderUserName, senderUserId, serverName, serverId, channelName, channelId
                ]
            );
        }
        catch (error) {
            console.error(`Failed to log message: ${error}`);
        }
    }
}