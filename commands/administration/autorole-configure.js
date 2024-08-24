const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { embedReply } = require("../../helpers/embed-reply");
const { embedColors } = require("../../config.json");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("autorole-configure")
        .setDescription("Sets a role to be automatically assigned to new members on join.")
        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("Choose a role that will get assigned to the new server members.")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            var localEmbedResponse = embedReply(
                embedColors.error,
                "Error",
                "You can only set autorole in a server.",
                interaction
            );
        }
        else if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.Administrator)) {
            var localEmbedResponse = embedReply(
                embedColors.error,
                "Error",
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

                const query = await db.query("SELECT guildId, roleId FROM autorole WHERE guildId = ?", [guildId]);
                const autoRoleGuildId = query[0]?.guildId || null;
                const autoRoleRoleId = query[0]?.roleId || null;

                //if autorole has already been configured at this server...
                if (autoRoleRoleId == targetRole) {
                    var localEmbedResponse = embedReply(
                        embedColors.error,
                        "Error",
                        "Autorole has been already configured for this server with this role. :x:\nRun the command with another role to overwrite the current role.\nRun `/autorole-disable` to disable this feature.",
                        interaction
                    );
                }
                else {
                    if (autoRoleGuildId == guildId) {
                        //if the target role is already the role that's in the database, then we don't need to insert data
                        var localEmbedResponse = embedReply(
                            embedColors.successSecondary,
                            "Autorole Configuration Modified",
                            `The role that will get assigned to new members has been **modified** to \`@<${targetRole}>\` :white_check_mark:\nRun this command again to modify the role.\nRun \`/autorole-disable\` to disable this feature.`,
                            interaction
                        );
                    }
                    else {
                        var localEmbedResponse = embedReply(
                            embedColors.success,
                            "Autorole Configuration Set",
                            `The role that will get assigned to new members has been **set** to \`@<${targetRole}>\` :white_check_mark:\nRun this command again to modify the role.\nRun \`/autorole-disable\` to disable this feature.`,
                            interaction
                        );
                    }

                    await db.query("INSERT INTO autorole (guildId, roleId, adderId, adderUsername) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE roleId = ?, adderId = ?, adderUsername = ?", [guildId, targetRole, adderId, adderUsername, targetRole, adderId, adderUsername]);
                }
            }
            catch (error) {
                console.error(error);
            }
        }

        await interaction.reply({ embeds: [localEmbedResponse] });

        //logging
        const response = JSON.stringify(localEmbedResponse.toJSON());
		await logToFileAndDatabase(interaction, response);
    }
}