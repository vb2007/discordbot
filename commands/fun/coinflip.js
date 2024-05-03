const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("coinflip")
        .setDescription("Flips a coin that has a 50/50 chance landing on head or tails."),
    async execute(interaction) {
        const random = (Math.floor(Math.random() * 2) == 0);

        if (random){
            var result = "head";
        }
        else{
            var result = "tails";
        }

        const embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: "Coinflip.",
            description: `You've flipped **${result}**.`,
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}` ,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
            },
        });

        await interaction.reply({ embeds: [embedReply]});

        //logging
        const logMessage =
            `Command: ${interaction.commandName}\n` +
            `Executer: ${interaction.user.tag} (ID: ${interaction.user.id})\n` +
            `Server: ${interaction.guild.name || "Not in server"} (ID: ${interaction.guild.id || "-"})\n` +
            `Time: ${new Date(interaction.createdTimestamp).toLocaleString()}\n\n`

        //console.log(logMessage);

        fs.appendFile("log/command-coinflip.log", logMessage, (err) => {
            if (err) {
                console.error("Error while writing the logs: ", err);
            }
        });
    }
}