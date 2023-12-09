const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a member from the server.')
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

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.reply({content: "Bot lacks the ban permission, cannot ban the member.", ephemeral: true });
        }

        try{
            await interaction.guild.members.ban(targetUser, { reason: reason });
            await interaction.reply({ content: `Successfully banned user ${targetUser.tag} for: ${reason}`, ephemeral: true});
        }
        catch (error){
            console.error(error);
            await interaction.reply({ content: "There was an error trying to ban the user.", ephemeral: true});
        }
    }
}    