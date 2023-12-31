const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        
        const embedReply = new EmbedBuilder({
            color : 0x5F0FD6,
            title : "Ping.",
            fields: [
                { name: "Pong!", value: ""},
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}` ,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
            }
        });
        
        await interaction.reply({ embeds: [embedReply] });
    }
}