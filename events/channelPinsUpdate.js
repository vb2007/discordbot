const logEventToChannel = require("./scripts/channelPinsUpdate/logEventToChannel");

module.exports = {
    name: "channelPinsUpdate",
    async execute(channel) {
        await logEventToChannel.sendLogInfo(channel);
    },
}