const { EmbedBuilder, SlashCommandBuilder, PermissionFlagBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("autorole")
        .setDescription("Sets a role to be automatically assigned to new members on join.")
        .addRoleOption(option =>
            option
                .setName("role")
                .setDescription("Choose a role that will get assigned to the new server members.")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagBits.ManageRoles),
    async execute(interaction) {
        const targetRole = interaction.options.get("role").value;
        
        if (!interaction.inGuild()) {
            var replyContent = "You can only set autorole in a server.";
        }
        else if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {

        }
        try {
            
        } catch (error) {
            
        }
    }
}