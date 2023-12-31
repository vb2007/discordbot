const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Purges (mass deletes) the given amount of messages from the current channel.")
        .addNumberOption(option =>
            option
                .setName("amount")
                .setDescription("The amount of messages the bot will purge.")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const messageAmount = interaction.options.get("amount").value;
        
        if (messageAmount > 100){
            return await interaction.reply("Cannot delete more than 100 messages at once due to Discord's limitations.");
        }

        await interaction.channel.bulkDelete(messageAmount);
        await interaction.reply(`Deleted ${messageAmount} messages successfully.`);
    }
}