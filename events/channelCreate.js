const logEventToChannel = require("./scripts/channelCreate/logEventToChannel");

module.exports = {
    name: "channelCreate",
    async execute(channel) {
        await logEventToChannel.sendLogInfo(channel);
    },
};