const db = require("../helpers/db");

module.exports = {
    name: "guildMemberAdd",
    async execute(member) {
        const guildId = member.guild.id;

        //autorole
        try {
            const rows = await db.query("SELECT roleId FROM autorole WHERE guildId = ?", [guildId]);
            const roleId = rows[0].roleId;

            if (roleId) {
                const role = member.guild.roles.cache.get(roleId);
                if (role) {
                    await member.roles.add(role);
                    console.log(`Assigned ${role.name} role to ${member.user.tag} in ${member.guild.name}`);
                }
            }
        }
        catch (error) {
            console.error(`Failed to addign role: ${error}`);
        }

        //welcome messages
        try {
            const rows = await db.query("SELECT channelId, message FROM welcome WHERE guildId = ?", [guildId]);
            const channelId = rows[0].channelId;
            const message = rows[0].message;

            if (channelId && message) {
                const channel = member.guild.channels.cache.get(channelId);
                if (channel) {
                    await channel.send(message.replace("{user}", member.user.tag));
                    console.log(`Sent welcome message to ${member.user.tag} in ${member.guild.name}`);
                }
            }
        }
        catch (error) {
            console.error(`Failed to display welcome message: ${error}`);
        }
    },
};