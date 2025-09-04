const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { embedReplyFailureColor, embedReplySuccessColor, embedReplySuccessSecondaryColor, embedReplyWarningColor } = require("../../helpers/embeds/embed-reply");
const { checkIfNotInGuild } = require("../../helpers/command-validation/general");
const replyAndLog = require("../../helpers/reply");
const db = require("../../helpers/db");

const commandName = "config-autorole";

module.exports = {
    data: new SlashCommandBuilder()
        .setName(commandName)
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
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .setDMPermission(false),
    async execute(interaction) {
        let title;
        let description;

        const action = interaction.options.getString("action");

        if (action === "configure") {
            const guildCheck = checkIfNotInGuild(commandName, interaction);
            if (guildCheck) {
                return await replyAndLog(interaction, guildCheck);
            }

            if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.Administrator)) {
                title = "AutoRole Configure: Error";
                description = "This feature requires **administrator** *(8)* privileges witch the bot currently lacks.\nIf you want this feature to work, please re-invite the bot with accurate privileges.";
                return await replyAndLog(interaction, embedReplyFailureColor(title, description, interaction));
            }

            else {
                try {
                    const targetRole = interaction.options.get("role").value;

                    if (!targetRole) {
                        title = "AutoRole Configure: Error";
                        description = "You must specify a role when configuring the autorole feature. :x:";
                        return await replyAndLog(interaction, embedReplyFailureColor(title, description, interaction));
                    }

                    const adderUsername = interaction.user.username;
                    const adderId = interaction.user.id;
                    const guildId = interaction.guild.id;

                    const query = await db.query("SELECT guildId, roleId FROM configAutorole WHERE guildId = ?", [guildId]);
                    const autoRoleGuildId = query[0]?.guildId || null;
                    const autoRoleRoleId = query[0]?.roleId || null;

                    //if autorole has already been configured for this server...
                    if (autoRoleRoleId == targetRole) {
                        title = "AutoRole Configure: Error";
                        description = "Autorole has already been configured for this server with this role. :x:\nRun the command with another role to overwrite the current role.";
                        return await replyAndLog(interaction, embedReplyFailureColor(title, description, interaction));
                    }
                    else {
                        await db.query("INSERT INTO configAutorole (guildId, roleId, adderId, adderUsername) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE roleId = ?, adderId = ?, adderUsername = ?", [guildId, targetRole, adderId, adderUsername, targetRole, adderId, adderUsername]);

                        if (autoRoleGuildId == guildId) {
                            title = "AutoRole Configure: Configuration Modified";
                            description = `The role that will get assigned to new members has been **modified** to <@&${targetRole}>. :white_check_mark:\nRun this command again to modify the role.`;
                            return await replyAndLog(interaction, embedReplySuccessSecondaryColor(title, description, interaction));
                        }
                        else {
                            title = "AutoRole Configure: Configuration Set";
                            description = `The role that will get assigned to new members has been **set** to <@&${targetRole}>. :white_check_mark:\nRun this command again to modify the role.`;
                            return await replyAndLog(interaction, embedReplySuccessColor(title, description, interaction));
                        }
                    }
                }
                catch (error) {
                    console.error(error);
                }
            }
        }

        if (action === "disable") {
            try {
                const currentGuildId = interaction.guild.id;
                const query = await db.query("SELECT guildId FROM configAutorole WHERE guildId = ?", [currentGuildId]);
                const autoroleGuildId = query[0]?.guildId || null;

                if (autoroleGuildId) {
                    await db.query("DELETE FROM configAutorole WHERE guildId = ?", [autoroleGuildId]);

                    title = "AutoRole Disable: Success";
                    description = "The autorole feature has been disabled succesfully. :white_check_mark:";
                    return await replyAndLog(interaction, embedReplySuccessColor(title, description, interaction));
                }
                else {
                    title = "AutoRole Disable: Warning";
                    description = "Autorole has not been configured for this server. :x:\nTherefore, you can't disable it.";
                    return await replyAndLog(interaction, embedReplyWarningColor(title, description, interaction));
                }
            }
            catch (error) {
                console.error(error);
            }
        }
    }
}