const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { embedReplyFailureColor, embedReplySuccessColor, embedReplySuccessSecondaryColor } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("config-autorole")
        .setDescription("Sets a role to be automatically assigned to new members on join.")
        .addStringOption(option =>
            option
                .setName("action")
                .setDescription("Configure or disable the autorole feature?")
                .addChoices(
                    { name: "configure", value: "configure" },
                    { name: "disable", value: "disable" }
                )
                .setRequired(true)
        )
        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("Choose a role that will get assigned to the new server members.")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            var embedReply = embedReplyFailureColor(
                "AutoRole Configure: Error",
                "You can only set up autorole in a server.",
                interaction
            );
        }
        else if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.Administrator)) {
            var embedReply = embedReplyFailureColor(
                "AutoRole Configure: Error",
                "This feature requires **administrator** *(8)* privileges witch the bot currently lacks.\nIf you want this feature to work, please re-invite the bot with accurate privileges.",
                interaction
            );
        }
        else {
            try {
                const targetRole = interaction.options.get("role").value;
                const adderUsername = interaction.user.username;
                const adderId = interaction.user.id;
                const guildId = interaction.guild.id;

                const query = await db.query("SELECT guildId, roleId FROM configAutorole WHERE guildId = ?", [guildId]);
                const autoRoleGuildId = query[0]?.guildId || null;
                const autoRoleRoleId = query[0]?.roleId || null;

                //if autorole has already been configured for this server...
                if (autoRoleRoleId == targetRole) {
                    var embedReply = embedReplyFailureColor(
                        "AutoRole Configure: Error",
                        "Autorole has already been configured for this server with this role. :x:\nRun the command with another role to overwrite the current role.\nRun `/autorole-disable` to disable this feature completely.",
                        interaction
                    );
                }
                else {
                    if (autoRoleGuildId == guildId) {
                        //if the target role is already the role that's in the database, then we don't need to insert data
                        var embedReply = embedReplySuccessSecondaryColor(
                            "AutoRole Configure: Configuration Modified",
                            `The role that will get assigned to new members has been **modified** to <@&${targetRole}>. :white_check_mark:\nRun this command again to modify the role.\nRun \`/autorole-disable\` to disable this feature.`,
                            interaction
                        );
                    }
                    else {
                        var embedReply = embedReplySuccessColor(
                            "AutoRole Configure: Configuration Set",
                            `The role that will get assigned to new members has been **set** to <@&${targetRole}>. :white_check_mark:\nRun this command again to modify the role.\nRun \`/autorole-disable\` to disable this feature.`,
                            interaction
                        );
                    }

                    await db.query("INSERT INTO configAutorole (guildId, roleId, adderId, adderUsername) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE roleId = ?, adderId = ?, adderUsername = ?", [guildId, targetRole, adderId, adderUsername, targetRole, adderId, adderUsername]);
                }
            }
            catch (error) {
                console.error(error);
            }
        }

        await interaction.reply({ embeds: [embedReply] });
        await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
    }
}