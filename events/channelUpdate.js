const logEventToChannel = require("./scripts/channelUpdate/logEventToChannel");

module.exports = {
    name: "channelUpdate",
    async execute(oldChannel, newChannel) {
        await logEventToChannel.sendLogInfo(channel);
    },
}