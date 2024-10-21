const logEventToChannel = require("./scripts/emojiCreate/logEventToChannel");

module.exports = {
    name: "emojiCreate",
    async execute(emoji) {
        await logEventToChannel.sendLogInfo(emoji);
    },
};