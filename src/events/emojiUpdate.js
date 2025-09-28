const logEventToChannel = require("./scripts/emojiUpdate/logEventToChannel");

module.exports = {
  name: "emojiUpdate",
  async execute(client, oldEmoji, newEmoji) {
    await logEventToChannel.sendLogInfo(client, oldEmoji, newEmoji);
  },
};
