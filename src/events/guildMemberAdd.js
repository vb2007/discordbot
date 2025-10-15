import { sendLogInfo } from "./scripts/guildMemberAdd/logEventToChannel.js";
import { assignRole } from "./scripts/guildMemberAdd/autorole.js";
import { sendWelcomeMessage } from "./scripts/guildMemberAdd/welcome.js";

export default {
  name: "guildMemberAdd",
  async execute(client, member) {
    await sendLogInfo(client, member);
    await assignRole(member);
    await sendWelcomeMessage(member);
  },
};
