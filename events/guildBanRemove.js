const logEventToChannel = require("./scripts/guildBanRemove/logEventToChannel");

module.exports = {
    name: "guildBanRemove",
    async execute(member) {
        await logEventToChannel.sendLogInfo(member);
    },
}