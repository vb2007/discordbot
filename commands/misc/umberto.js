const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("umberto")
        .setDescription("igen."),
    async execute(interaction) {

        const embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: "Umberto",
            description: "Polesznyák Márk László",
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}` ,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
            },
        });

        await interaction.reply({ embeds: [embedReply]});
    }
}