const autorole = require("./scripts/guildMemberAdd/autorole");
const welcome = require("./scripts/guildMemberAdd/welcome");

module.exports = {
    name: "guildMemberAdd",
    async execute(member) {
        await autorole.assignRole(member);
        await welcome.sendWelcomeMessage(member);
    },
};