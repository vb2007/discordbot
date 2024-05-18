// const { Client, GuildMember } = require("discord.js");
const db = require("../db");

module.exports = {
    name: "guildMemberJoin",
    async execute(member) {
        const guildId = member.guildId.id;

        try {
            const [rows] = await db.query("SELECT roleId FROM joinrole WHERE guildId = ?", [guildId]);
            const roleId = rows[0].roleId;

            if (roleId) {
                const role = member.guild.roles.cache.get(roleId);
                if (role) {
                    await member.roles.add(role);
                    console.log(`Assigned ${role.name} role to ${member.user.tag} in ${member.guild.name}`);
                }
            }
        } catch (error) {
            console.error(error);
        }
    },
};