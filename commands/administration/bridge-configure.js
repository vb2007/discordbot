const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { embedReplySuccessColor, embedReplyFailureColor } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bridge-configure")
        .setDescription("Sets up bridging between a source channel on another server and a destination channel on the current one.")
        .addStringOption(option =>
            option
                .setName("source-channel-id")
                .setDescription("The ID of the source channel on another server.")
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName("destination-channel")
                .setDescription("A channel where the bot will send the bridged messages.")
                .addChannelTypes(0)
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
    async execute(interaction) {
        
    }
}