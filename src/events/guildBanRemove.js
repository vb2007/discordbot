import { sendLogInfo } from "./scripts/guildBanRemove/logEventToChannel.js";

export default {
  name: "guildBanRemove",
  async execute(client, unban) {
    await sendLogInfo(client, unban);
  },
};
