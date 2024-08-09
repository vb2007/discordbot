const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("withdraw")
        .setDescription("Withdraws a specified amount of money from your bank account.")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("The amount of money you want to withdraw.")
                .setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        const amount = interaction.options.getInteger("amount");
        const interactionUserId = interaction.user.id;
        const query = await db.query("SELECT balance, balanceInBank FROM economy WHERE userId = ?", [interactionUserId]);
        const balance = query[0]?.balance || null;
        const balanceInBank = query[0]?.balanceInBank || null;

        if (balanceInBank < amount) {
            var replyContent = `You can't withdraw that much money from your bank account.\nYour current bank balance is only \`$${balanceInBank}\`.`;
        }
        else {
            
        }
    }
}    