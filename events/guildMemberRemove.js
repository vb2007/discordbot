const logEventToChannel = require("./scripts/guildMemberRemove/logEventToChannel");

module.exports = {
    name: "guildMemberRemove",
    async execute(client, member) {
        await logEventToChannel.sendLogInfo(client, member);
    },
}