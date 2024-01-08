const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pinta")
        .setDescription("igen."),
    async execute(interaction) {
        
        const embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: "Pina",
            description: "Pintarics Dévényi Zsombor",
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}` ,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
            },
        });

        await interaction.reply({ embeds: [embedReply]});
    }
}