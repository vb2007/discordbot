const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        const reply = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle("Pong!")
            .setDescription("Ping.")
        
        await interaction.reply({ embeds: [reply] });
    }
}