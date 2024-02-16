const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kicks a member from the server.")
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
            }
            catch (error){
                console.error(error);
                var replyContent = "There was an error trying to kick the user.";
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
    }
}    