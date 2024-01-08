const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("coinflip")
        .setDescription("Flips a coin. (what else did you expect?)"),
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
    }
}