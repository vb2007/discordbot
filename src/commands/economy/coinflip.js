const { SlashCommandBuilder } = require("discord.js");
const { embedReplySuccessColor, embedReplyFailureColor } = require("../../helpers/embeds/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("coinflip")
        .setDescription("Let's you bet a specified amout of money on heads or tais.")
        .addStringOption(option =>
            option
                .setName("side")
                .setDescription("The side of the coin you would like to place your bet on.")
                .addChoices(
                    { name: "Head", value: false },
                    { name: "Tails", value: true }
                )
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("The amount of money you would like to play with.")
                .setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            var embedReply = embedReplyFailureColor(
                "Roulette - Error",
                "You can only play roulette in a server.",
                interaction
            );
        }
        else {
            const interactionUserId = interaction.user.id;
            const amount = interaction.options.getInteger("amount");

            const query = await db.query("SELECT balance, lastCoinflipTime FROM economy WHERE userId = ?", [interactionUserId]);
            const userBalance = query[0]?.balance;
        }
    }
}