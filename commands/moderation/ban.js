const { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Bans a member from the server.")
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
            }
            catch (error){
                console.error(error);
                var replyContent = "There was an error trying to ban the user.";
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
    }
}    