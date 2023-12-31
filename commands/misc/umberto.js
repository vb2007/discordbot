const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("umberto")
        .setDescription("igen."),
    async execute(interaction) {
        await interaction.reply("Polesznyák Márk László");
    }
}