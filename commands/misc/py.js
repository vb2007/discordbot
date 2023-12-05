const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('py')
        .setDescription('facts.'),
    async execute(interaction) {
        await interaction.reply('.py egy autista geci (és nem küld képet a lábáról)')
    }
}