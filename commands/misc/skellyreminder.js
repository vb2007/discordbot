const { SlashCommandBuilder } = require("discord.js");
const cron = require("node-cron");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reminder")
        .setDescription("Sets a reminder.")
        .addStringOption(option =>
            option.setName("message")
            .setDescription("The reminder's message.")
            .setRequired(true))
        .addUserOption(option =>
            option.setName("user")
            .setDescription("The user you want to remind daily (leave empty if you want to remind yourself).")
            .setRequired(false)),
    async execute(interaction) {
        const channel = interaction.channel;
        //const guild = interaction.guild;

        const reminderMessage = interaction.options.getString("message");

        cron.schedule("10 * * * * *", () => {
            channel.send(`${reminderMessage} - <@${interaction.user.id}>`);
        });

        await interaction.reply(`Reminder set successfully. I will remind <@${user.id} at `);
    }
}