const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skellylaba')
        .setDescription('Küld egy képet Skelly lábáról.'),
    async execute(interaction) {
        await interaction.reply('Skelly szőrös lába :hot_face: :https://cdn.discordapp.com/attachments/1177710851344564234/1177710869371687035/image.png')
    }
}