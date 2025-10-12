import { sendLogInfo } from "./scripts/guildMemberRemove/logEventToChannel.js";
import { sendGoodbyeMessage } from "./scripts/guildMemberRemove/goodbye.js";

export default {
  name: "guildMemberRemove",
  async execute(client, member) {
    await sendLogInfo(client, member);
    await sendGoodbyeMessage(member);
  },
};
