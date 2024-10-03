const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { embedReplyPrimaryColor, embedReplyFailureColor } = require("../../helpers/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("welcome-configure")
        .setDescription("Sets a welcome message that will be displayed for the new members in a specified channel.")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("A channel where the welcome message will be displayed.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("A message that the new members will see. You can use the following placeholders: {user} - the new member's username, {server} - the server's name, {memberCount} - the server's member count.")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            var embedReply = embedReplyFailureColor(
                "Welcome Configure: Error",
                "You can only set a welcome message in a server.",
                interaction
            );
        }

        await interaction.reply({ embeds: [embedReply] });

        //logging
        const response = JSON.stringify(embedReply.toJSON());
        await logToFileAndDatabase(interaction, response);
    }
}