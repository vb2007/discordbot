const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { embedReplySuccessColor, embedReplySuccessSecondaryColor, embedReplyFailureColor } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("config-darwin")
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
                            "UPDATE configDarwin SET channelId = ?, channelName = ?, adderId = ?, adderUsername = ? WHERE guildId = ?",
                            [channelId, channelName, adderId, adderUsername, guildId]
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
                        "INSERT INTO configDarwin (guildId, channelId, channelName, adderId, adderUsername) VALUES (?, ?, ?, ?, ?)",
                        [guildId, channelId, channelName, adderId, adderUsername]
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