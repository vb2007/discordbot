const logEventToChannel = require("./scripts/messageUpdate/logEventToChannel");

module.exports = {
    name: "messageUpdate",
    async execute(oldMessage, newMessage) {
        await logEventToChannel.sendLogInfo(oldMessage, newMessage);
    },
}