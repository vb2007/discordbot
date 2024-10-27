const logEventToChannel = require("./scripts/messageDelete/logEventToChannel");

module.exports = {
    name: "messageDelete",
    async execute(message) {
        await logEventToChannel.sendLogInfo(message);
    },
}