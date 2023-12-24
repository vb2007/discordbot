const { SlashCommandBuilder, PermissionFlagsBits, time } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("timeout")
        .setDescription("Times out a member from the server.")
        .addUserOption(option =>
            option
                .setName("target")
                .setDescription("Choose your target.")
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName("time")
                .setDescription("Specify the time in minutes.")
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName("reason")
                .setDescription("Give a reason.")
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),
    async execute(interaction) {
        const targetUser = interaction.options.getUser("target");
        const reason = interaction.options.getString("reason") || "No reason provided";
        const time = interaction.options.getInteger("time");

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.MuteMembers)) {
            return interaction.reply({content: "Bot lacks the timeout(aka. mute) permission, cannot ban the member.", ephemeral: true });
        }

        try{
            await interaction.guild.members.timeout(targetUser, { reason: reason });
            await interaction.reply({ content: `Successfully timed out user ${targetUser.tag} for ${time} minutes, because of: ${reason}`, ephemeral: true});
        }
        catch (error){
            console.error(error);
            await interaction.reply({ content: "There was an error trying to time out the user.", ephemeral: true});
        }
    }
}    