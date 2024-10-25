const db = require("./db");

/**
 * @param {object} object - An channel, message, etc. object from a guild
 * @returns {doesGuildExist} A boolean value indicating if the guild exists in the database
 * @returns {query} A query object containing the guildId and logChannelId
 */
module.exports = {
    async getGuildFromDB(object) {
        const guildId = object.guild.id;

        const query = await db.query("SELECT guildId, logChannelId FROM configLogging WHERE guildId = ?", [guildId]);
        const existingGuildId = query[0]?.guildId;

        const doesGuildExist = existingGuildId ? true : false;

        return doesGuildExist, query;
    }
}