const logEventToChannel = require("./scripts/channelUpdate/logEventToChannel");

module.exports = {
    name: "channelUpdate",
    async execute(client, oldChannel, newChannel) {
        await logEventToChannel.sendLogInfo(client, oldChannel, newChannel);
    },
}