const logEventToChannel = require("./scripts/guildBanRemove/logEventToChannel");

module.exports = {
    name: "guildBanRemove",
    async execute(member, reason) {
        await logEventToChannel.sendLogInfo(member, reason);
    },
}