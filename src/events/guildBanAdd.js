const logEventToChannel = require("./scripts/guildBanAdd/logEventToChannel");

module.exports = {
  name: "guildBanAdd",
  async execute(client, ban) {
    await logEventToChannel.sendLogInfo(client, ban);
  },
};
