const logEventToChannel = require("./scripts/guildBanAdd/logEventToChannel");

module.exports = {
    name: "guildBanAdd",
    async execute(client, member, reason) {
        await logEventToChannel.sendLogInfo(client, member, reason);
    },
}