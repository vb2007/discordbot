const db = require("../../../helpers/db");
const { embedMessageSuccessColor } = require("../../../helpers/embed-reply");

module.exports = {
    async sendLogInfo(member) {
        const guildId = member.guild.id;

        try {
            const query = await db.query("SELECT guildId, logChannelId FROM configLogging WHERE guildId = ?", [guildId]);
            const existingGuildId = query[0]?.guildId;
            const logChannelId = query[0]?.logChannelId;

            if (existingGuildId) {
                const logEmbed = embedMessageSuccessColor(
                    "Member joined",
                    `${member.user.tag} joined the server.`,
                );

                await logChannelId.send({ embeds: [logEmbed] });
            }
        }
        catch (error) {
            console.error(`Failed to send log info to target channel: ${error}`);
        }
    }
}