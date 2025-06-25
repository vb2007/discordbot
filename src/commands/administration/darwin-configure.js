const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { embedReplySuccessColor, embedReplySuccessSecondaryColor, embedReplyFailureColor } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

//hardcoded for now, will be configurable later
const DEFAULT_FEED_URL = "https://theync.com/most-recent/";
const DEFAULT_INTERVAL = 30000;
const DEFAULT_MARKER_ONE = "https://theync.com/media/video";
const DEFAULT_MARKER_TWO = "https://theync.com";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("darwin-configure")
        .setDescription("Sets up automatic video posting from a feed to a channel.")
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("The channel where videos will be posted.")
                .addChannelTypes(0)
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            var embedReply = embedReplyFailureColor(
                "Darwin Configure: Error",
                "You can only set up Darwin in a server.",
                interaction
            );
        }
        else {
            try {
                const channel = interaction.options.getChannel("channel");
                
                const feedUrl = DEFAULT_FEED_URL;
                const interval = DEFAULT_INTERVAL;
                
                const guildId = interaction.guild.id;
                const adderId = interaction.user.id;
                const adderUsername = interaction.user.username;
                const channelId = channel.id;
                const channelName = channel.name;
                
                const query = await db.query("SELECT * FROM configDarwin WHERE guildId = ?", [guildId]);
                const existingConfig = query[0] || null;
                
                if (existingConfig) {
                    if (channelId !== existingConfig.channelId) {
                        var embedReply = embedReplySuccessSecondaryColor(
                            "Darwin Configure: Channel Updated",
                            `Successfully changed Darwin channel to <#${channelId}>. :white_check_mark:\n` +
                            `Videos will now be posted to <#${channelId}>.\n` +
                            `Use \`/darwin-disable\` to disable the service.`,
                            interaction
                        );
                        
                        await db.query(
                            "UPDATE configDarwin SET channelId = ?, channelName = ?, adderId = ?, adderUsername = ?, isEnabled = TRUE WHERE guildId = ?",
                            [channelId, channelName, adderId, adderUsername, guildId]
                        );
                    }
                    else if (!existingConfig.isEnabled) {
                        var embedReply = embedReplySuccessColor(
                            "Darwin Configure: Re-enabled",
                            `Darwin has been re-enabled! :white_check_mark:\n` +
                            `Videos will be posted to <#${channelId}>.\n` +
                            `Use \`/darwin-disable\` to disable again.`,
                            interaction
                        );
                        
                        await db.query(
                            "UPDATE configDarwin SET isEnabled = TRUE, adderId = ?, adderUsername = ? WHERE guildId = ?",
                            [adderId, adderUsername, guildId]
                        );
                    }
                    else {
                        var embedReply = embedReplyFailureColor(
                            "Darwin Configure: No Change",
                            `Darwin is already configured to post videos to <#${channelId}>.\n` + 
                            `No changes were made.`,
                            interaction
                        );
                    }
                }
                else {
                    var embedReply = embedReplySuccessColor(
                        "Darwin Configure: Configuration Set",
                        `Darwin has been configured successfully! :white_check_mark:\n` +
                        `Videos will be posted to <#${channelId}>.\n` +
                        `Use \`/darwin-disable\` to disable.`,
                        interaction
                    );
                    
                    await db.query(
                        "INSERT INTO configDarwin (guildId, channelId, channelName, feedUrl, `interval`, markerOne, markerTwo, adderId, adderUsername) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [guildId, channelId, channelName, feedUrl, interval, DEFAULT_MARKER_ONE, DEFAULT_MARKER_TWO, adderId, adderUsername]
                    );
                }
            }
            catch (error) {
                console.error(`Error configuring Darwin: ${error}`);
                var embedReply = embedReplyFailureColor(
                    "Darwin Configure: Error",
                    "An error occurred while configuring Darwin. Please try again.",
                    interaction
                );
            }
        }
        
        await interaction.reply({ embeds: [embedReply] });
        await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
    }
};