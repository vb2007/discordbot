const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const db = require("../../db");
const autoroleDisable = require("./autorole-disable");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("autorole-configure")
        .setDescription("Sets a role to be automatically assigned to new members on join.")
        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("Choose a role that will get assigned to the new server members.")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            var replyContent = "You can only set autorole in a server.";
        }
        else if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.Administrator)) {
            var replyContent = "This feature requires **administrator** *(8)* privileges witch the bot currently lacks.\nIf you want this feature to work, please re-invite the bot with accurate privileges."
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
                var doQuery = true;
                if (autoRoleGuildId == guildId) {
                    //if the target role is already the role that's in the database, then we don't need to insert data
                    if (autoRoleRoleId == targetRole) {
                        replyContent = "Autorole has been already configured for this server with this role. :x:\nRun the command with another role to overwrite the current role.\nRun `/autorole-disable` to disable this feature.";
                        var doQuery = false;
                    }
                    else {
                        replyContent = `The role that will get assigned to new members has been set to @<${targetRole}> :white_check_mark:\nRun \`/autorole-disable\` to disable this feature.`;
                    }
                }
                else {
                    var replyContent = "Autorole has been **successfully configured** for this server. :white_check_mark:\nRun this command again to modify the role.\nRun `/autorole-disable` to disable this feature.";
                }
                if (doQuery) {
                    var roleId = targetRole;
                    await db.query("INSERT INTO autorole (guildId, roleId, adderId, adderUsername) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE roleId = ?, adderId = ?, adderUsername = ?", [guildId, roleId, adderId, adderUsername, roleId, adderId, adderUsername]);
                }
            } 
            catch (error) {
                console.error(error);
            }
        }

        var embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: "Configuring autorole.",
            description: replyContent,
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}` ,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
            },
        });

        await interaction.reply({ embeds: [embedReply] });

        const logMessage = 
            `Command: ${interaction.commandName}\n` +
            `Executer: ${interaction.user.tag} (ID: ${interaction.user.id})\n` +
            `Server: ${interaction.inGuild() ? `${interaction.guild.name} (ID: ${interaction.guild.id})` : "Not in a server." }\n` +
            `Time: ${new Date(interaction.createdTimestamp).toLocaleString()}\n\n`

        //console.log(logMessage);

        fs.appendFile("log/command-autoroleConfigure.log", logMessage, (err) => {
            if (err) {
                console.error("Error while writing the logs: ", err);
            }
        });
    }
}