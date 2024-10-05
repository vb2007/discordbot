const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { embedReplySuccessColor, embedReplySuccessSecondaryColor, embedReplyWarningColor, embedReplyFailureColor } = require("../../helpers/embed-reply");
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
                //the description length is limited to 100 characters ¯\_(ツ)_/¯
                .setDescription("A message that the new members will see.") //You can use the following placeholders: {user} - the new member's username, {server} - the server's name, {memberCount} - the server's member count.
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
        else if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.Administrator)) {
            var embedReply = embedReplyFailureColor(
                "Welcome Disable: Error",
                "This feature requires **administrator** *(8)* privileges which the bot currently lacks.\nIf you want this feature to work, please re-invite the bot with accurate privileges.",
                interaction
            );
        }
        else {
            try {
                const channelId = interaction.options.getChannel("channel").id;
                const welcomeMessage = interaction.options.getString("message");
                const guildId = interaction.guild.id;
                const adderId = interaction.user.id;
                const adderUsername = interaction.user.username;

                const query = await db.query("SELECT guildId, channelId, message FROM welcome WHERE guildId = ?", [guildId]);
                const existingChannelId = query[0]?.channelId || null;
                const existingWelcomeMessage = query[0]?.message || null;
                const existingGuildId = query[0]?.guildId || null;

                //if welcome messages has already been configured for this server...
                if (welcomeMessage == existingWelcomeMessage && channelId == existingChannelId) {
                    var embedReply = embedReplyWarningColor(
                        "Welcome Configure: Warning",
                        "The same welcome message has already been configured in this server for that channel. :x:\nRun the command with another channel and/or new welcome message to overwrite the current setup.\nRun `/welcome-disable` if you want to disable this feature.",
                        interaction
                    );
                }
                else {
                    if (channelId == existingChannelId) {
                        var embedReply = embedReplySuccessSecondaryColor(
                            "Welcome Configure: Configuration Modified",
                            "The **welcome message** has been successfully **modified**. :white_check_mark:\nRun this command again later if you want to modify the message / channel.\nRun `/welcome-disable` if you want to disable this feature.",
                            interaction
                        );
                    }
                    else if (welcomeMessage == existingWelcomeMessage) {
                        var embedReply = embedReplySuccessSecondaryColor(
                            "Welcome Configure: Configuration Modified",
                            `The **welcome channel** has been successfully **modified** to <#${channelId}>. :white_check_mark:\nRun this command again later if you want to modify the message / channel.\nRun \`/welcome-disable\` if you want to disable this feature.`,
                            interaction
                        );
                    }
                    else {
                        var embedReply = embedReplySuccessColor(
                            "Welcome Configure: Configuration Set",
                            "The **welcome message** has been successfully **set**. :white_check_mark:\nRun this command again later if you want to modify the message / channel.\nRun `/welcome-disable` if you want to disable this feature.",
                            interaction
                        );
                    }

                    await db.query("INSERT INTO welcome (guildId, channelId, message, adderId, adderUsername) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE channelId = ?, message = ?, adderId = ?, adderUsername = ?",
                        [guildId, channelId, welcomeMessage, adderId, adderUsername, channelId, welcomeMessage, adderId, adderUsername]
                    );
                }
            }
            catch (error) {
                var embedReply = embedReplyFailureColor(
                    "Welcome Configure: Error",
                    "There was an error while trying to configure the welcome messages.",
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