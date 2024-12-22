const logEventToChannel = require("./scripts/guildMemberRemove/logEventToChannel");
const goodbye = require("./scripts/guildMemberRemove/goodbye");

module.exports = {
    name: "guildMemberRemove",
    async execute(client, member) {
        await logEventToChannel.sendLogInfo(client, member);
        await goodbye.sendGoodbyeMessage(member);
    },
}