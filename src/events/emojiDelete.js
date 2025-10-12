import { sendLogInfo } from "./scripts/emojiDelete/logEventToChannel.js";

export default {
  name: "emojiDelete",
  async execute(client, emoji) {
    await sendLogInfo(client, emoji);
  },
};
