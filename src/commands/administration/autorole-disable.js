const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { embedReplyFailureColor, embedReplySuccessColor, embedReplyWarningColor } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("autorole-disable")
        .setDescription("Disables the role that is automatically assigned to new members on join.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            var embedReply = embedReplyFailureColor(
                "AutoRole Disable: Error",
                "You can only disable autorole in a server.",
                interaction
            );
        }
        else if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.Administartor)) {
            var embedReply = embedReplyFailureColor(
                "AutoRole Disable: Error",
                "This feature requires **administrator** *(8)* privileges witch the bot currently lacks.\nIf you want this feature to work, please re-invite the bot with accurate privileges.",
                interaction
            );
        }
        else {
            try {
                const currentGuildId = interaction.guild.id;
                //we need rows, because the query gives back a messed up array
                const query = await db.query("SELECT guildId FROM configAutorole WHERE guildId = ?", [currentGuildId]);
                const autoroleGuildId = query[0]?.guildId || null;

                if (autoroleGuildId) {
                    await db.query("DELETE FROM configAutorole WHERE guildId = ?", [autoroleGuildId]);

                    var embedReply = embedReplySuccessColor(
                        "AutoRole Disable: Success",
                        "The autorole feature has been disabled succesfully. :white_check_mark:\nYou can re-enable it with `/autorole-configure`.",
                        interaction
                    );
                }
                else {
                    var embedReply = embedReplyWarningColor(
                        "AutoRole Disable: Warning",
                        "Autorole has not been configured for this server. :x:\nTherefore, you can't disable it.\nYou can enable this feature with `/autorole-configure`.",
                        interaction
                    );
                }
            }
            catch (error) {
                console.error(error);
            }
        }

        await interaction.reply({ embeds: [embedReply] });
        await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
    },
};