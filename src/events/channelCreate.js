import { sendLogInfo } from "./scripts/channelCreate/logEventToChannel.js";

export default {
  name: "channelCreate",
  async execute(client, channel) {
    await sendLogInfo(client, channel);
  },
};
