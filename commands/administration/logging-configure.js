const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { embedReplySuccessColor, embedReplySuccessSecondaryColor, embedReplyWarningColor, embedReplyFailureColor } = require("../../helpers/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("logging-configure")
        .setDescription("Sets up logging with various options for the current server.")
        .addChannelOption(option =>
            option
                .setName("target-channel")
                .setDescription("A channel where the bot will send the logged data.")
                .addChannelType(0) //= text channels
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
    async execute(interaction) {
        
    }
}