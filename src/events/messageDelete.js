const logEventToChannel = require("./scripts/messageDelete/logEventToChannel");

module.exports = {
    name: "messageDelete",
    async execute(client, message) {
        await logEventToChannel.sendLogInfo(client, message);
    },
}