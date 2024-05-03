const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Bans a specified member from the server.")
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
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const targetUser = interaction.options.getUser("target");
        const reason = interaction.options.getString("reason") || "No reason provided";

        if (!interaction.inGuild()) {
            var replyContent = "You can only ban members in a server.";
        }
        else if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            var replyContent = "Bot lacks the ban permission, cannot ban the member.";
        }
        else{
            try{
                await interaction.guild.members.ban(targetUser, { reason: reason });
                var replyContent = `Successfully banned user ${targetUser.tag} for: ${reason}`;
                try{
                    const embedDmReply = new EmbedBuilder({
                        color: 0x5F0FD6,
                        title: "You have been banned.",
                        description: `You have banned from **${interaction.guild.name}** for: **${reason}** \nIf you believe this was a mistake, please contact a moderator.`,
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
                var replyContent = "There was an error while trying to ban the user.";
            }
        }        

        const embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: "Smashing with the banhammer.",
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

        fs.appendFile("log/command-ban.log", logMessage, (err) => {
            if (err) {
                console.error("Error while writing the logs: ", err);
            }
        });
    }
}    