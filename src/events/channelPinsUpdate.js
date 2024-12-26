const logEventToChannel = require("./scripts/channelPinsUpdate/logEventToChannel");

module.exports = {
    name: "channelPinsUpdate",
    async execute(client, channel) {
        await logEventToChannel.sendLogInfo(client, channel);
    },
}