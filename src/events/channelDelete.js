import { sendLogInfo } from "./scripts/channelDelete/logEventToChannel.js";

export default {
  name: "channelDelete",
  async execute(client, channel) {
    await sendLogInfo(client, channel);
  },
};
