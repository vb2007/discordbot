const { SlashCommandBuilder } = require("discord.js");
const { embedReplyPrimaryColor } = require("../../helpers/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("911-countdown")
        .setDescription("Displays how much time is left until 9/11.")
        .setDMPermission(true),
    async execute(interaction) {
        const now = new Date();
        const currentYear = now.getUTCFullYear();
        const targetDate = new Date(Date.UTC(currentYear, 8, 11)) //8, because months are 0-indexed

        //if 9/11 has already passed this year
        if (now > targetDate) {
            targetDate.setUTCFullYear(currentYear + 1);
        }

        const timeDiffernce = targetDate - now;

        const days = Math.floor(timeDiffernce / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiffernce % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiffernce % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiffernce % (1000 * 60)) / 1000);

        const embedReply = embedReplyPrimaryColor(
            "911 Countdown",
            `Time left until 9/11: **${days} days ${hours} hours ${minutes} minutes ${seconds} seconds**.`,
            interaction
        );

        await interaction.reply({ embeds: [embedReply] });

        //logging
        const response = JSON.stringify(embedReply.toJSON());
		await logToFileAndDatabase(interaction, response);
    }
}