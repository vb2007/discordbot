const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path").basename;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("randomfeet")
        .setDescription("Elküld egy random lábképet."),
    async execute(interaction) {
        //vár ha egyszerre túl sok a lábkép kérelem...
        await interaction.deferReply();

        //lábkép adatbázis
        const labkepek = [
            "https://cdn.discordapp.com/attachments/1181726473623715921/1182428481385148577/py1.png",
            "https://cdn.discordapp.com/attachments/1181726473623715921/1182428490780389387/py2.webp",
            "https://cdn.discordapp.com/attachments/1181726473623715921/1182428495306035230/skelly1.jpg",
            "https://cdn.discordapp.com/attachments/1181726473623715921/1182428504986505266/skelly2.jpg",
            "https://cdn.discordapp.com/attachments/1181726473623715921/1182428508383875162/skelly3.jpg",
            "https://cdn.discordapp.com/attachments/1181726473623715921/1182428523638554684/theevilapple1.jpg",
            "https://cdn.discordapp.com/attachments/1181726473623715921/1182428531553210448/theevilapple2.jpg",
            "https://cdn.discordapp.com/attachments/1181726473623715921/1182428543779602553/theevilapple3.jpg",
            "https://cdn.discordapp.com/attachments/1181726473623715921/1182428553581711443/theevilapple4.jpg",
            "https://cdn.discordapp.com/attachments/1181726473623715921/1182762500119343224/bsmaci1.png"
        ];
        // const labkepek = [
        //     "http://vb2007.hu/cdn/feet/bsmaci1.jpg",
        //     "http://vb2007.hu/cdn/feet/py1.png",
        //     "http://vb2007.hu/cdn/feet/py2.webp",
        //     "http://vb2007.hu/cdn/feet/skelly1.jpg",
        //     "http://vb2007.hu/cdn/feet/skelly2.jpg",
        //     "http://vb2007.hu/cdn/feet/skelly3.jpg",
        //     "http://vb2007.hu/cdn/feet/skelly4.jpg",
        //     "http://vb2007.hu/cdn/feet/theevilapple1.jpg",
        //     "http://vb2007.hu/cdn/feet/theevilapple2.jpg",
        //     "http://vb2007.hu/cdn/feet/theevilapple3.jpg"
        // ]

        //random képet választ a listából
        const randomFeet = labkepek[Math.floor(Math.random() * labkepek.length)];

        //attachment készítése
        const attachment = new AttachmentBuilder(randomFeet);

        //válasz a parancsra
        await interaction.editReply({ files: [attachment] });

        //logol
        const logMessage =
            `Command: ${interaction.commandName}\n` +
            `User: ${interaction.user.tag} (ID: ${interaction.user.id})\n` +
            `Server: ${interaction.guild.name} (ID: ${interaction.guild.id})\n` +
            `Time: ${new Date(interaction.createdTimestamp).toLocaleString}\n` +
            `Response: Sent ${randomFeet}\n\n`;

        //console.log(logMessage);

        fs.appendFile("log/command-randomfeet.log", logMessage, (err) => {
            if (err) {
                console.error("Error while writing the logs: ", err);
            }
        });
    }
}