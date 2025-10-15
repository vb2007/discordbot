import { sendLogInfo } from "./scripts/emojiCreate/logEventToChannel.js";

export default {
  name: "emojiCreate",
  async execute(client, emoji) {
    await sendLogInfo(client, emoji);
  },
};
