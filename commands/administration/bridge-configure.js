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
        if (!interaction.inGuild()) {
            var embedReply = embedReplyFailureColor(
                "Bridge Configure: Error",
                "You can only set up bridging in a server.",
                interaction
            );
        }
        else {
            try {
                const sourceChannelId = interaction.options.getString("source-channel-id");
                const targetChannel = interaction.options.getChannel("destination-channel");

                const interactionUserId = interaction.user.id;
                const interactionUsername = interaction.user.username;
                const targetChannelId = targetChannel.id;
                const targetChannelName = targetChannel.name;
                const guildId = interaction.guild.id;

                const query = await db.query("SELECT guildId, sourceChannelId, destinationChannelId FROM configBridging WHERE sourceChannelId = ?", [sourceChannelId]);
            }
            catch (error) {
                console.error(`Failed to configure bridging: ${error}`);
                var embedReply = embedReplyFailureColor(
                    "Bridge Configure: Error",
                    "Failed to configure bridging. Please try again.",
                    interaction
                );  
            }
        }

        await interaction.reply({ embeds: [embedReply] });

        //logging
        const response = JSON.stringify(embedReply.toJSON());
        await logToFileAndDatabase(interaction, response);
    }
}