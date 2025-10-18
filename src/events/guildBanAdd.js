import { sendLogInfo } from "./scripts/guildBanAdd/logEventToChannel.js";

export default {
  name: "guildBanAdd",
  async execute(client, ban) {
    await sendLogInfo(client, ban);
  },
};
