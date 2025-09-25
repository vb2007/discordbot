const logEventToChannel = require("./scripts/channelDelete/logEventToChannel");

module.exports = {
  name: "channelDelete",
  async execute(client, channel) {
    await logEventToChannel.sendLogInfo(client, channel);
  },
};
