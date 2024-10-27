const logEventToChannel = require("./scripts/guildMemberRemove/logEventToChannel");

module.exports = {
    name: "guildMemberRemove",
    async execute(member) {
        await logEventToChannel.sendLogInfo(member);
    },
}