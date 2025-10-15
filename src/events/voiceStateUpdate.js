import { sendLogInfo } from "./scripts/voiceStateUpdate/logEventToChannel.js";

export default {
  name: "voiceStateUpdate",
  async execute(client, oldState, newState) {
    await sendLogInfo(client, oldState, newState);
  },
};
