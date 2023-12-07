const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomfeet')
        .setDescription('Elküld egy random lábképet.'),
    async execute(interaction) {

        //lábkép adatbázis
        const labkepek = [
            "https://cdn.discordapp.com/attachments/1181726473623715921/1182428485914984610/bsmaci1.jpg",
            "https://cdn.discordapp.com/attachments/1181726473623715921/1182428481385148577/py1.png",
            "https://cdn.discordapp.com/attachments/1181726473623715921/1182428490780389387/py2.webp",
            "https://cdn.discordapp.com/attachments/1181726473623715921/1182428495306035230/skelly1.jpg",
            "https://cdn.discordapp.com/attachments/1181726473623715921/1182428504986505266/skelly2.jpg",
            "https://cdn.discordapp.com/attachments/1181726473623715921/1182428508383875162/skelly3.jpg",
            "https://cdn.discordapp.com/attachments/1181726473623715921/1182428523638554684/theevilapple1.jpg",
            "https://cdn.discordapp.com/attachments/1181726473623715921/1182428531553210448/theevilapple2.jpg",
            "https://cdn.discordapp.com/attachments/1181726473623715921/1182428543779602553/theevilapple3.jpg",
            "https://cdn.discordapp.com/attachments/1181726473623715921/1182428553581711443/theevilapple4.jpg"
        ];

        //random képet választ a listából
        const randomFeet = labkepek[Math.floor(Math.random() * labkepek.length)];

        //attachment készítése
        const attachment = new AttachmentBuilder(randomFeet);

        //válasz a parancsra
        await interaction.reply({ files: [attachment] });
    }
}