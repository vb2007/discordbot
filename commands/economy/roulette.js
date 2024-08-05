const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { logToFileAndDatabase } = require("../../helpers/logger");
const format = require("../../helpers/format");
const db = require("../../helpers/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("roulette")
        .setDescription("Try your luck and play a game of roulette.")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("The amount of money you would like to play with.")
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName("color")
                .setDescription("The color you would like to to bet on.")
                .addChoices(
                    { name: "Red", value: "red" },
                    { name: "Black", value: "black" },
                    { name: "Green", value: "green" }
                )
                .setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            var replyContent = "You can only play roulette in a server.";
        }
        else {
            const interactionUserId = interaction.user.id;
            const amount = interaction.options.getInteger("amount");

            var query = await db.query("SELECT balance FROM economy WHERE userId = ?", [interactionUserId]);
            var userBalance = query[0]?.balance;

            if (userBalance < amount) {
                var replyContent = `You can't play with that much money!\nYour current balance is only \`$${userBalance}\`.`;
            }
            else if (amount <= 0) {
                var replyContent = `You can't play without money.\nPlease enter a positive amount that's in you balance range.\nYour current balance is \`$${userBalance}\`.`;
            }
            else {
                const rouletteNumbers = Array.from({ length: 37}, (_, index) => index + 1); //37 = european roulette. this might be configureable later.
                function generateRandomOutcome() {
                    const randomIndex = Math.floor(Math.random() * rouletteNumbers.length);
                    const number = rouletteNumbers[randomIndex]
                    //green if number is 0, black if it's devideable by 2, red othervise 
                    const color = number === 0 ? "green" : (number % 2 === 0 ? "black" : "red");
                    return { number, color };
                }
                
                const guessedColor = interaction.options.getString("color");

                const randomOutcome = generateRandomOutcome();
                const randomColor = randomOutcome.color;
                const randomNumber = randomOutcome.number;

                switch (guessedColor) {
                    case randomColor && guessedColor === "green":
                        await db.query("UPDATE economy SET balance = balance + ? WHERE userId = ?",
                            [
                                amount * 35,
                                interactionUserId
                            ]
                        );

                        var replyContent = `The ball landed on **${format.formatRouletteColor(randomColor)} ${randomNumber}**.\nYour guess was **${format.formatRouletteColor(randomColor)}**.\nYou hit the jackpot! :money_mouth:`;
                        break;
                    case randomColor:
                        await db.query("UPDATE economy SET balance = balance + ? WHERE userId = ?",
                            [
                                amount * 2,
                                interactionUserId
                            ]
                        );

                        var replyContent = `The ball landed on **${format.formatRouletteColor(randomColor)} ${randomNumber}**.\nYour guess was **${format.formatRouletteColor(randomColor)}** as well! :money_mouth:`;
                        break;
                    case "red" || "black" || "green":
                        await db.query("UPDATE economy SET balance = balance - ? WHERE userId = ?",
                            [
                                amount,
                                interactionUserId
                            ]
                        );

                        var replyContent = `The ball landed on **${format.formatRouletteColor(randomColor)} ${randomNumber}**.\nYour guess was **${format.formatRouletteColor(randomColor)}**.\nMaybe try your luck again. :upside_down:`;
                        break;
                    default:
                        var replyContent = "The color you've chosen is invalid.\nPlease choose from *red*, *black* or *green*.";
                }
            }
        }

        var embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: "Playing roulette.",
            description: replyContent,
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}`,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true })
            }
        });

        await interaction.reply({ embeds: [embedReply] })

        //logging
        const response = JSON.stringify(embedReply.toJSON());
        await logToFileAndDatabase(interaction, response);
    }
}