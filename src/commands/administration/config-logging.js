const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { embedReplySuccessColor, embedReplySuccessSecondaryColor, embedReplyFailureColor } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("config-logging")
        .setDescription("Sets up logging with various options for the current server.")
        .addStringOption(option =>
            option
                .setName("action")
                .setDescription("Configure or disable the logging feature?")
                .addChoices(
                    { name: "configure", value: "configure" },
                    { name: "disable", value: "disable" }
                )
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName("target-channel")
                .setDescription("A channel where the bot will send the logged data.")
                .addChannelTypes(0) //= text channels
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            var embedReply = embedReplyFailureColor(
                "Logging Configure: Error",
                "You can only set up logging in a server.",
                interaction
            );
        }
        else if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.Administrator)) {
            var embedReply = embedReplyFailureColor(
                "Logging Configure: Error",
                "Logging some actions requires **administrator** *(8)* privileges which the bot currently lacks.\nIf you want this feature to work properly, please re-invite the bot with accurate privileges.",
                interaction
            );
        }
        else {
            try {
                const targetChannel = interaction.options.getChannel("target-channel");
                const interactionUserId = interaction.user.id;
                const interactionUsername = interaction.user.username
                const targetChannelId = targetChannel.id;
                const targetChannelName = targetChannel.name;
                const guildId = interaction.guild.id;

                const query = await db.query("SELECT guildId, logChannelId FROM configLogging WHERE guildId = ?", [guildId]);
                const existingGuildId = query[0]?.guildId || null;
                const existingLogChannelId = query[0]?.logChannelId || null;

                if (existingLogChannelId == targetChannelId) {
                    var embedReply = embedReplyFailureColor(
                        "Logging Configure: Error",
                        `Logging has already been configured for this server for the channel <#${targetChannelId}>. :x:\nRun the command with another channel to overwrite the current channel.`,
                        interaction
                    );
                }
                else {
                    if (existingGuildId == guildId) {
                        var embedReply = embedReplySuccessSecondaryColor(
                            "Logging Configure: Configuration Modified",
                            `The logging channel has been updated to <#${targetChannelId}>. :white_check_mark:\nRun this command again to modify the channel.\nRun \`/logging-disable\` to disable this feature completely.`,
                            interaction
                        );

                        await db.query("UPDATE configLogging SET logChannelId = ?, logChannelName = ?, lastModifierId = ?, lastModifierName = ? WHERE guildId = ?",
                            [
                                targetChannelId, targetChannelName, interactionUserId, interactionUsername, guildId
                            ]
                        );
                    }
                    else {
                        var embedReply = embedReplySuccessColor(
                            "Logging Configure: Configuration Set",
                            `Logging has been set up for this server in <#${targetChannelId}>. :white_check_mark:\nRun this command again to modify the channel.\nRun \`/logging-disable\` to disable this feature completely.`,
                            interaction
                        );

                        await db.query("INSERT INTO configLogging (guildId, logChannelId, logChannelName, firstConfigurerId, firstConfigurerName) VALUES (?, ?, ?, ?, ?)",
                            [
                                guildId, targetChannelId, targetChannelName, interactionUserId, interactionUsername
                            ]
                        );
                    }
                }
            }
            catch (error) {
                // console.error(`Failed to configure logging: ${error}`);
                var embedReply = embedReplyFailureColor(
                    "Logging Configure: Error",
                    "Failed to configure logging. Please try again.",
                    interaction
                );
            }
        }

        await interaction.reply({ embeds: [embedReply] });
        await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
    }
}