const { SlashCommandBuilder } = require('discord.js');
const { embedReplyPrimaryColor } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");

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

        var embedReply = embedReplyPrimaryColor(
            "Coinflip.",
            `You've flipped **${result}**.`,
            interaction
        );

        await interaction.reply({ embeds: [embedReply]});
        await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
    }
}