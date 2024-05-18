const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const db = require("../../db");

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
                var guildId = interaction.guild.id;
                let autoRole = await db.query("SELECT guildId FROM autorole WHERE guildId = ?", [guildId]);

                if (autoRole) {
                    if (autoRole === targetRole){
                        replyContent = "Autorole has been already configured for this server.\nRun `/autorole-disable` to disable this feature.";
                        return;
                    }

                    roleId = targetRole;
                }
                else{
                    var roleId = targetRole;
                }

                await db.query("INSERT INTO autorole (guildId, roleId) VALUES (?, ?) ON DUPLICATE KEY UPDATE roleId = ?", [guildId, roleId, roleId]);
                var replyContent = "Autorole has been **successfully configured** for this server. :white_check_mark:\nRun `/autorole-disable` to disable this feature.";
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