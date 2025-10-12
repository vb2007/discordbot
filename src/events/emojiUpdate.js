import { sendLogInfo } from "./scripts/emojiUpdate/logEventToChannel.js";

export default {
  name: "emojiUpdate",
  async execute(client, oldEmoji, newEmoji) {
    await sendLogInfo(client, oldEmoji, newEmoji);
  },
};
