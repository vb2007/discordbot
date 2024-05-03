const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Displays the discord API's current latency."),
    async execute(interaction) {

        const embedReply = new EmbedBuilder({
            color : 0x5F0FD6,
            title : "Ping.",
            fields: [
                { name: "Pong! :ping_pong:", value: ""},
                { name: "Response time: ", value: `${Date.now() - interaction.createdTimestamp}ms`, inline: true },
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}` ,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
            }
        });
        
        await interaction.reply({ embeds: [embedReply] });

        //logging
        const logMessage =
            `Command: ${interaction.commandName}\n` +
            `Executer: ${interaction.user.tag} (ID: ${interaction.user.id})\n` +
            `Server: ${interaction.guild.name || "Not in server"} (ID: ${interaction.guild.id || "-"})\n` +
            `Time: ${new Date(interaction.createdTimestamp).toLocaleString()}\n\n`

        //console.log(logMessage);

        fs.appendFile("log/command-help.log", logMessage, (err) => {
            if (err) {
                console.error("Error while writing the logs: ", err);
            }
        });
    }
}