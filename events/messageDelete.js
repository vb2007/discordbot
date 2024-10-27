const logEventToChannel = require("./scripts/mmessageDelete/logEventToChannel");

module.exports = {
    name: "messageDelete",
    async execute(message) {
        await logEventToChannel.sendLogInfo(message);
    },
}