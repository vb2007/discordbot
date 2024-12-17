const logEventToChannel = require("./scripts/guildBanRemove/logEventToChannel");

module.exports = {
    name: "guildBanRemove",
    async execute(client, member) {
        await logEventToChannel.sendLogInfo(client, member);
    },
}