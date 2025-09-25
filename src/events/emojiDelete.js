const logEventToChannel = require("./scripts/emojiDelete/logEventToChannel");

module.exports = {
  name: "emojiDelete",
  async execute(client, emoji) {
    await logEventToChannel.sendLogInfo(client, emoji);
  },
};
