const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { logToFileAndDatabase } = require("../../logger");

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
        const response = `Replied with: ${embedReply.toJSON()}`;
		await logToFileAndDatabase(interaction, response);
    }
}