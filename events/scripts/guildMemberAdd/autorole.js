const db = require("../../../helpers/db");

module.exports = {
    async assignRole (member) {
        const guildId = member.guild.id;
        const serverName = member.guild.name;

        const userTag = member.user.tag;

        try {
            const rows = await db.query("SELECT roleId FROM autorole WHERE guildId = ?", [guildId]);
            const roleId = rows[0]?.roleId;

            if (roleId) {
                const role = member.guild.roles.cache.get(roleId);
                if (role) {
                    await member.roles.add(role);
                    console.log(`Assigned ${role.name} role to ${userTag} in ${serverName}`);
                }
            }
        }
        catch (error) {
            console.error(`Failed to assign role: ${error}`);
        }
    }
}