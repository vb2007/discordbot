import { sendLogInfo } from "./scripts/messageDelete/logEventToChannel.js";

export default {
  name: "messageDelete",
  async execute(client, message) {
    await sendLogInfo(client, message);
  },
};
