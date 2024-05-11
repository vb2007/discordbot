const { EmbedBuilder, SlashCommandBuilder, PermissionFlagBits } = require("discord.js");
const db = require("../../db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("autorole-configure")
        .setDescription("Sets a role to be automatically assigned to new members on join.")
        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("Choose a role that will get assigned to the new server members.")
                .setRequired(true)),
        // .setDefaultMemberPermissions(PermissionFlagBits.ManageRoles),
    async execute(interaction) {
        const targetRole = interaction.options.get("role").value;
        
        if (!interaction.inGuild()) {
            var replyContent = "You can only set autorole in a server.";
        }
        // else if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
        //     var replyContent = "Only administrators (who can manage roles) set up this feature."
        // }
        else {
            try {
                let autoRole = await db.query("SELECT guild FROM autorole WHERE guildId = ?", [targetRole]);

                if (autoRole) {
                    if (autoRole === targetRole){
                        replyContent = "Autorole has been already configured for this server.\nRun `/autorole-disable` to disable this feature."
                        return;               
                    }

                    autoRole = targetRole;
                }
                else{
                    const guildId = interaction.guild.id;
                    const roleId = targetRole;
                }

                await db.query("INSERT INTO autorole (guildId, roleId) VALUES (?, ?) ON DUPLICATE KEY UPDATE roleId = ?", [guildId, roleId, roleId], )
                var replyContent = "Autorole has been **successfully configured** for this server. :white_check_mark:\nRun `/autorole-disable` to disable this feature."
            } catch (error) {
                
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

        await interaction.reply({ embeds: [embedReply] })

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