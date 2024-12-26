const logEventToChannel = require("./scripts/guildMemberAdd/logEventToChannel");
const autorole = require("./scripts/guildMemberAdd/autorole");
const welcome = require("./scripts/guildMemberAdd/welcome");

module.exports = {
    name: "guildMemberAdd",
    async execute(client, member) {
        await logEventToChannel.sendLogInfo(client, member);
        await autorole.assignRole(member);
        await welcome.sendWelcomeMessage(member);
    },
};