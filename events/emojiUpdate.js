const logEventToChannel = require("./scripts/emojiUpdate/logEventToChannel");

module.exports = {
    name: "emojiUpdate",
    async execute(oldEmoji, newEmoji) {
        await logEventToChannel.sendLogInfo(oldEmoji, newEmoji);
    },
}