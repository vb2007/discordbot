const logEventToChannel = require("./scripts/emojiCreate/logEventToChannel");

module.exports = {
  name: "emojiCreate",
  async execute(client, emoji) {
    await logEventToChannel.sendLogInfo(client, emoji);
  },
};
