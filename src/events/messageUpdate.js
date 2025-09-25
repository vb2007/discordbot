const logEventToChannel = require("./scripts/messageUpdate/logEventToChannel");

module.exports = {
  name: "messageUpdate",
  async execute(client, oldMessage, newMessage) {
    await logEventToChannel.sendLogInfo(client, oldMessage, newMessage);
  },
};
