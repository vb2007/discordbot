const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kicks a specified member from the server.")
        .addUserOption(option =>
            option
                .setName("target")
                .setDescription("Choose your target.")
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Give a reason.")
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction) {
        const targetUser = interaction.options.getUser("target");
        const reason = interaction.options.getString("reason") || "No reason provided";

        if (!interaction.inGuild()) {
            var replyContent = "You can only kick members in a server.";
        }
        else if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
            var replyContent = "Bot lacks the kick permission, cannot kick member.";
        }
        else{
            try{
                await interaction.guild.members.kick(targetUser, { reason: reason });
                var replyContent = `Successfully kicked user **${targetUser.tag}** for: **${reason}**`;
                try{
                    const embedDmReply = new EmbedBuilder({
                        color: 0x5F0FD6,
                        title: "You have been kicked.",
                        description: `You have kicked out from **${interaction.guild.name}** for: **${reason}** \nIf you believe this was a mistake, please contact a moderator.`,
                        timestamp: new Date().toISOString(),
                        footer: {
                            text: `Moderator: ${interaction.user.username}` ,
                            icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
                        },
                    });
                    await targetUser.send({ embeds: [embedDmReply] });
                    replyContent += "\nThe user was notified about the reason in their DMs.";
                }
                catch (error){
                    console.error(error);
                    replyContent += "\nThere was an error while trying to DM the user.";
                }
            }
            catch (error){
                console.error(error);
                var replyContent = "There was an error while trying to kick the user.";
            }
        }

        const embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: "Kicking a user out.",
            description: `${replyContent}`,
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}` ,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
            },
        });

        await interaction.reply({ embeds: [embedReply] });

        //logging
        const logMessage =
            `Command: ${interaction.commandName}\n` +
            `Executer: ${interaction.user.tag} (ID: ${interaction.user.id})\n` +
            `Server: ${interaction.inGuild() ? `${interaction.guild.name} (ID: ${interaction.guild.id})` : "Not in a server." }\n` +
            `Time: ${new Date(interaction.createdTimestamp).toLocaleString()}\n\n`

        //console.log(logMessage);

        fs.appendFile("log/command-kick.log", logMessage, (err) => {
            if (err) {
                console.error("Error while writing the logs: ", err);
            }
        });
    }
}    