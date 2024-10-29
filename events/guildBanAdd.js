const logEventToChannel = require("./scripts/guildBanAdd/logEventToChannel");

module.exports = {
    name: "guildBanAdd",
    async execute(member, reason) {
        await logEventToChannel.sendLogInfo(member, reason);
    },
}