const { SlashCommandBuilder } = require("discord.js");
const cron = require("node-cron");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("dailyreminder")
        .setDescription("Sets a daily reminder.")
        .addStringOption(option =>
            option.setName("message")
            .setDescription("The reminder's message.")
            .setRequired(true))
        .addStringOption(option =>
            option.setName("time")
            .setDescription("When will the bot remind you (HH:mm format)")
            .setRequired(true))
        .addUserOption(option =>
            option.setName("user")
            .setDescription("The user you want to remind daily (leave empty if you want to remind yourself).")
            .setRequired(false)),
        
    async execute(interaction) {
        //const guild = interaction.guild;
        const channel = interaction.channel;
        const reminderMessage = interaction.options.getString("message");
        const time = interaction.options.getString("time");
        const remindedUser = interaction.options.getUser("user");
        const [hour, minute] = time.split(":");

        if(hour > 24 || minute > 60){
            await interaction.reply("The entered time format isn't correct. Please try again with the **HH:mm** format.");
            return;
        }

        cron.schedule(`0 ${minute} ${hour} * * *`, () => {
            channel.send(`<@${remindedUser.id}> - ${reminderMessage}`);
        });

        await interaction.reply(`Reminder set successfully. I will remind <@${remindedUser.id}> at ${time} every day.`);
    }
}