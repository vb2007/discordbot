const logEventToChannel = require("./scripts/guildMemberRemove/logEventToChannel");

module.exports = {
    name: "guildMemberRemove",
    async execute(member, reason) {
        await logEventToChannel.sendLogInfo(member, reason);
    },
}