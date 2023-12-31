const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pinta')
        .setDescription('igen.'),
    async execute(interaction) {
        await interaction.reply('Pintarics Dévényi Zsombor');
    }
}