const logEventToChannel = require("./scripts/voiceStateUpdate/logEventToChannel");

module.exports = {
  name: "voiceStateUpdate",
  async execute(client, oldState, newState) {
    await logEventToChannel.sendLogInfo(client, oldState, newState);
  },
};
