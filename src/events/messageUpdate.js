import { sendLogInfo } from "./scripts/messageUpdate/logEventToChannel.js";

export default {
  name: "messageUpdate",
  async execute(client, oldMessage, newMessage) {
    await sendLogInfo(client, oldMessage, newMessage);
  },
};
