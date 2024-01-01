const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("py")
        .setDescription("facts.")
        .addStringOption(option =>
            option
                .setName("extra")
                .setDescription("Choose between displaying a full legal name or just some straight facts.")
                .addChoices(
                    { name: "name", value: "name_value" },
                    { name: "facts", value: "facts_value" },
                )
                .setRequired(true)),
    async execute(interaction) {
        const extraOption = interaction.options.getString("extra");

        if (extraOption == "name_value"){
            var replyContent = "Szekeres Dávid Krisztián";
        }
        else if (extraOption == "facts_value"){
            var replyContent = ".py egy autista geci"
        }

        const embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: ".py",
            description: replyContent,
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}` ,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
            },
        });

        await interaction.reply({ embeds: [embedReply]});
    }
}