const db = require("./db");

module.exports = {
    /**
     * @param {object} object - An channel, message, etc. object from a guild
     * @returns {doesGuildExist} A boolean value indicating if the guild exists in the database
     * @returns {logChannelId} A log channel ID from the database based on the guild ID (if configured)
     */
    async getGuildFromDB(guildId) {
        if (!guildId) return { doesGuildExist: false, logChannelId: null };
        
        const query = await db.query("SELECT guildId, logChannelId FROM configLogging WHERE guildId = ?", [guildId]);
        const logChannelId = query[0]?.logChannelId;
        
        const doesGuildExist = logChannelId ? true : false;
        return { doesGuildExist, logChannelId };
    }
} 