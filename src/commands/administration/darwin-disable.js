const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { embedReplySuccessColor, embedReplyFailureColor } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("darwin-disable")
        .setDescription("Disables automatic video posting from Darwin.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            var embedReply = embedReplyFailureColor(
                "Darwin Disable: Error",
                "You can only disable Darwin in a server.",
                interaction
            );
        }
        else {
            try {
                const guildId = interaction.guild.id;
                
                const query = await db.query("SELECT * FROM configDarwin WHERE guildId = ?", [guildId]);
                const existingConfig = query[0] || null;
                
                if (existingConfig) {
                    await db.query("DELETE FROM configDarwin WHERE guildId = ?", [guildId]);
                    
                    var embedReply = embedReplySuccessColor(
                        "Darwin Disable: Success",
                        "Darwin has been disabled for this server. :white_check_mark:\n" +
                        "You can re-enable it with `/darwin-configure`.",
                        interaction
                    );
                }
                else {
                    var embedReply = embedReplyFailureColor(
                        "Darwin Disable: Error",
                        "Darwin has not been configured for this server yet.\n" +
                        "Use `/darwin-configure` to set it up first.",
                        interaction
                    );
                }
            }
            catch (error) {
                console.error(`Error disabling Darwin: ${error}`);

                var embedReply = embedReplyFailureColor(
                    "Darwin Disable: Error",
                    "An error occurred while disabling Darwin. Please try again.",
                    interaction
                );
            }
        }
        
        await interaction.reply({ embeds: [embedReply] });
        await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
    }
};