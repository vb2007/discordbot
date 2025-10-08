const logEventToChannel = require("./scripts/guildBanRemove/logEventToChannel");

module.exports = {
  name: "guildBanRemove",
  async execute(client, unban) {
    await logEventToChannel.sendLogInfo(client, unban);
  },
};
