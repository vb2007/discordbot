const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("gore")
        .setDescription("Sends gore duh."),
    async execute(interaction) {
        await interaction.deferReply();

        const embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: "Gore",
            description: "Here is some random gore:",
            image: {
               url: `${}`
            },
            timestamp: new Date.toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}`,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
            },
        });

        await interaction.editReply({ embeds: [embedReply] });
    }
}