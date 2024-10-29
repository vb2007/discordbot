const logEventToChannel = require("./scripts/emojiDelete/logEventToChannel");

module.exports = {
    name: "emojiDelete",
    async execute(emoji) {
        await logEventToChannel.sendLogInfo(emoji);
    },
}