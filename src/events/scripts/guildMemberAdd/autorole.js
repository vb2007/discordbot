import { query } from "../../../helpers/db.js";

export const assignRole = async (member) => {
  const guildId = member.guild.id;
  const serverName = member.guild.name;

  const userTag = member.user.tag;

  try {
    const rows = await query("SELECT roleId FROM configAutorole WHERE guildId = ?", [guildId]);
    const roleId = rows[0]?.roleId;

    if (roleId) {
      const role = member.guild.roles.cache.get(roleId);
      if (role) {
        await member.roles.add(role);
        console.log(`Assigned ${role.name} role to ${userTag} in ${serverName}`);
      }
    }
  } catch (error) {
    console.error(`Failed to assign role: ${error}`);
  }
};
