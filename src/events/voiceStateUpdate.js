const logEventToChannel = require("./scripts/channelUpdate/logEventToChannel");

module.exports = {
  name: "voiceStateUpdate",
  async execute(client, oldState, newState) {
    await logEventToChannel.sendLogInfo(client, oldState, newState);
  },
};
