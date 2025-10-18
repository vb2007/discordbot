import { sendLogInfo } from "./scripts/channelUpdate/logEventToChannel.js";

export default {
  name: "channelUpdate",
  async execute(client, oldChannel, newChannel) {
    await sendLogInfo(client, oldChannel, newChannel);
  },
};
