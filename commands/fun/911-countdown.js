const { SlashCommandBuilder } = require("discord.js");
const { embedReplyPrimaryColor } = require("../../helpers/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("911-countdown")
        .setDescription("Displays how much time is left until 9/11.")
        .setDMPermission(true),
    async execute(interaction) {
        
    }
}