const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Purges (mass deletes) the given amount of messages from the current channel.")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("The amount of messages the bot will purge.")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const messageAmount = interaction.options.getInteger("amount");
        
    }
}