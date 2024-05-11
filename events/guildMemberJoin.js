const { databaseConnectionString } = require("../config.json");
const db = databaseConnectionString;

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
                    
                }
            }
        } catch (error) {
            
        }
    }
}