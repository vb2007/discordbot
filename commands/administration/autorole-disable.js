const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const db = require("../../db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("autorole-disable")
        .setDescription("Disables the role that is automatically assigned to new members on join.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            var replyContent = "You can only disable autorole in a server."
        }
        else if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.Administartor)) {
            var replyContent = "This feature requires **administrator** *(8)* privileges witch the bot currently lacks.\nIf you want this feature to work, please re-invite the bot with accurate privileges."
        }
        else {
            try {
                const currentGuildId = interaction.guild.id;
                console.log(currentGuildId)
                //we need rows, because the query gives back a messed up array
                const [rows] = await db.query("SELECT guildId FROM autorole WHERE guildId = ?", [currentGuildId]);
                const autoroleGuildId = rows[0];
                console.log(autoroleGuildId)

                if (autoroleGuildId) {
                    await db.query("DELETE FROM autorole WHERE guildId = ?", [autoroleGuildId]);

                    var replyContent = "The autorole feature has been disabled succesfully.\nYou can re-enable it with `/autorole-configure`."
                }
                else {
                    var replyContent = "Autorole has not been configured for this server.\nTherefore, you can't disable it."
                }
            }
            catch (error) {
                console.log(error);
            }
        }

        var embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: "Disabling autorole.",
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

        fs.appendFile("log/command-autoroleDisable.log", logMessage, (err) => {
            if (err) {
                console.error("Error while writing the logs: ", err);
            }
        });
    },
};