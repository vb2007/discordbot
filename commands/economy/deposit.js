const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { logToFileAndDatabase } = require("../../helpers/logger");
const db = require("../../helpers/db");
const { execute } = require("./work");

module.ecports = {
    data: new SlashCommandBuilder()
        .setName("deposit")
        .setDescription("Desposits a specified amount of money to your bank account.")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("The amount of money you want to deposit.")
                .setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        
    }
}