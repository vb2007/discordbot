const logEventToChannel = require("./scripts/channelCreate/logEventToChannel");

module.exports = {
    name: "channelCreate",
    async execute(client, channel) {
        await logEventToChannel.sendLogInfo(client, channel);
    },
};