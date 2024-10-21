const logEventToChannel = require("./scripts/channelDelete/logEventToChannel");

module.exports = {
    name: "channelDelete",
    async execute(channel) {
        await logEventToChannel.sendLogInfo(channel);
    },
};