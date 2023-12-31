const { SlashCommandBuilder } = require('discord.js');

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
            await interaction.reply("Szekeres Dávid Krisztián");
        }
        else if (extraOption == "facts_value"){
            await interaction.reply(".py egy autista geci");
        }
    }
}