const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { embedReplySuccessColor, embedReplySuccessSecondaryColor, embedReplyWarningColor, embedReplyFailureColor } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("config-welcome")
        .setDescription("Sets a welcome message that will be displayed for the new members in a specified channel.")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("A channel where the welcome message will be displayed.")
                .addChannelTypes(0) //= GUILD_TEXT aka. text channels
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("message")
                //the description length is limited to 100 characters ¯\_(ツ)_/¯
                .setDescription("A message that the new members will see.") //You can use the following placeholders: {user} - the new member's username, {server} - the server's name, {memberCount} - the server's member count.
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option
                .setName("embed")
                .setDescription("Whether the message should be sent as an embed (doesn't supports pinging users).")
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option
                .setName("embed-color")
                .setDescription("The HEX color of the embed message. Leave empty for default color.")
                .setRequired(false)
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
                "Welcome Configure: Error",
                "This feature requires **administrator** *(8)* privileges which the bot currently lacks.\nIf you want this feature to work, please re-invite the bot with accurate privileges.",
                interaction
            );
        }
        else {
            try {
                const channelId = interaction.options.getChannel("channel").id;
                const welcomeMessage = interaction.options.getString("message");
                const isEmbed = interaction.options.getBoolean("embed") || 0;
                const embedColor = interaction.options.getInteger("embed-color") || null;

                const guildId = interaction.guild.id;
                const adderId = interaction.user.id;
                const adderUsername = interaction.user.username;

                const query = await db.query("SELECT channelId, message, isEmbed, embedColor FROM configWelcome WHERE guildId = ?", [guildId]);
                const existingChannelId = query[0]?.channelId || null;
                const existingWelcomeMessage = query[0]?.message || null;
                const existingIsEmbed = query[0]?.isEmbed || 0;
                const existingEmbedColor = query[0]?.embedColor || null;

                //if welcome messages haven't been configured for the current server
                if (!existingChannelId) {
                    var embedReply = embedReplySuccessColor(
                        "Welcome Configure: Configuration Set",
                        "The **welcome message** has been successfully **set**. :white_check_mark:\nRun this command again later if you want to modify the current configuration.\nRun `/welcome-disable` if you want to disable this feature.",
                        interaction
                    );
                }
                else {
                    //checks if anything has been modified in the the command
                    let modifications = [];
                    if (welcomeMessage != existingWelcomeMessage) {
                        modifications.push("**welcome message**");
                    }
                    if (isEmbed != existingIsEmbed) {
                        modifications.push("**embed option**");
                    }
                    if (embedColor != existingEmbedColor) {
                        modifications.push("**embed color**");
                    }
                    if (channelId != existingChannelId) {
                        modifications.push(`**welcome channel** to <#${channelId}>`);
                    }

                    //if the exact same welcome configuration is set for the current server (aka. nothing got modified)
                    if (modifications.length === 0) {
                        var embedReply = embedReplyWarningColor(
                            "Welcome Configure: Warning",
                            "The exact same welcome configuration has been set for this server already. :x:\nRun the command again with different options to overwrite the current configuration.\nRun `/welcome-disable`, if you want to disable this feature.",
                            interaction
                        );
                    }
                    //if the welcome configuration has been modified
                    else {
                        let modificationsMessage;
                        if (modifications.length === 1) {
                            modificationsMessage = modifications[0];
                        } else {
                            modificationsMessage = modifications.slice(0, -1).join(", ") + " and " + modifications[modifications.length - 1];
                        }

                        var embedReply = embedReplySuccessSecondaryColor(
                            "Welcome Configure: Configuration Modified",
                            `Successfully modified ${modificationsMessage}. :white_check_mark:\nRun the command again with different options to overwrite the current configuration.\nRun \`/welcome-disable\`, if you want to disable this feature.`,
                            interaction
                        );
                    }
                }

                await db.query("INSERT INTO configWelcome (guildId, channelId, message, isEmbed, embedColor, adderId, adderUsername) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE channelId = ?, message = ?, adderId = ?, adderUsername = ?, isEmbed = ?, embedColor = ?",
                    [guildId, channelId, welcomeMessage, isEmbed, embedColor, adderId, adderUsername, channelId, welcomeMessage, adderId, adderUsername, isEmbed, embedColor]
                );
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
        await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
    }
}