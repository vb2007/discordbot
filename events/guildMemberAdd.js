const db = require("../helpers/db");

module.exports = {
    name: "guildMemberAdd",
    async execute(member) {
        const guildId = member.guild.id;

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
            console.error(error);
        }
    },
};