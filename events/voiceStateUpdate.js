const logEventToChannel = require("./scripts/channelUpdate/logEventToChannel");

module.exports = {
    name: "voiceStateUpdate",
    async execute(oldState, newState) {
        await logEventToChannel.sendLogInfo(oldState, newState);
    },
}; 