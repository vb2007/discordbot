const { SlashCommandBuilder, PermissionFlagsBits, time } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("coinflip")
        .setDescription("Flips a coin. (what else did you expect?)"),
    async execute(interaction) {
        const random = (Math.floor(Math.random() * 2) == 0);

        if (random){
            const result = "head";
        }
        else{
            const result = "tails";
        }

        await interaction.reply(`You've flipped ${result}.`);
    }
}