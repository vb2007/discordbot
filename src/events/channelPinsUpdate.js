import { sendLogInfo } from "./scripts/channelPinsUpdate/logEventToChannel.js";

export default {
  name: "channelPinsUpdate",
  async execute(client, channel) {
    await sendLogInfo(client, channel);
  },
};
