const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
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
        // const labkepek = [
        //     "https://cdn.discordapp.com/attachments/1181726473623715921/1182428481385148577/py1.png",
        //     "https://cdn.discordapp.com/attachments/1181726473623715921/1182428490780389387/py2.webp",
        //     "https://cdn.discordapp.com/attachments/1181726473623715921/1182428495306035230/skelly1.jpg",
        //     "https://cdn.discordapp.com/attachments/1181726473623715921/1182428504986505266/skelly2.jpg",
        //     "https://cdn.discordapp.com/attachments/1181726473623715921/1182428508383875162/skelly3.jpg",
        //     "https://cdn.discordapp.com/attachments/1181726473623715921/1182428523638554684/theevilapple1.jpg",
        //     "https://cdn.discordapp.com/attachments/1181726473623715921/1182428531553210448/theevilapple2.jpg",
        //     "https://cdn.discordapp.com/attachments/1181726473623715921/1182428543779602553/theevilapple3.jpg",
        //     "https://cdn.discordapp.com/attachments/1181726473623715921/1182428553581711443/theevilapple4.jpg",
        //     "https://cdn.discordapp.com/attachments/1181726473623715921/1182762500119343224/bsmaci1.png"
        // ];

        const labkepek = [
            "https://vb2007.hu/extended-cdn/feetpics/bsmaci1.jpg",
            "https://vb2007.hu/extended-cdn/feetpics/forgacs.webp",
            "https://vb2007.hu/extended-cdn/feetpics/py1.png",
            "https://vb2007.hu/extended-cdn/feetpics/py2.webp",
            "https://vb2007.hu/extended-cdn/feetpics/py3.webp",
            "https://vb2007.hu/extended-cdn/feetpics/py4.webp",
            "https://vb2007.hu/extended-cdn/feetpics/py5.webp",
            "https://vb2007.hu/extended-cdn/feetpics/skelly1.jpg",
            "https://vb2007.hu/extended-cdn/feetpics/skelly2.jpg",
            "https://vb2007.hu/extended-cdn/feetpics/skelly3.jpg",
            "https://vb2007.hu/extended-cdn/feetpics/skelly4.jpg",
            "https://vb2007.hu/extended-cdn/feetpics/theevilapple1.jpg",
            "https://vb2007.hu/extended-cdn/feetpics/theevilapple2.jpg",
            "https://vb2007.hu/extended-cdn/feetpics/theevilapple3.jpg",
            "https://vb2007.hu/extended-cdn/feetpics/theevilapple4.jpg",

        ]

        //random képet választ a listából
        const randomFeet = labkepek[Math.floor(Math.random() * labkepek.length)];

        const embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: "Randomfeet.",
            description: "Here is a random feetpic:",
            image: {
                url: `${randomFeet}`
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}` ,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
            },
        });

        await interaction.editReply({ embeds: [embedReply] });

        //logol
        const logMessage =
            `Command: ${interaction.commandName}\n` +
            `User: ${interaction.user.tag} (ID: ${interaction.user.id})\n` +
            `Server: ${interaction.guild.name || "Not in server"} (ID: ${interaction.guild.id || "-"})\n` +
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