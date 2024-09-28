const { SlashCommandBuilder } = require("discord.js");
const { embedReplyPrimaryColor } = require("../../helpers/embed-reply");
const { logToFileAndDatabase } = require("../../helpers/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("911-countdown")
        .setDescription("Displays how much time is left until 9/11.")
        .addStringOption(option =>
            option
                .setName("utc-offset")
                .setDescription("The offset that the bot will calculate the time difference with.")
                .addChoices(
                    //according to wikipedia: https://en.wikipedia.org/wiki/List_of_UTC_offsets
                    { name: "UTC-12", value: "-12" },
                    { name: "UTC-11", value: "-11" },
                    { name: "UTC-10", value: "-10" },
                    { name: "UTC-9", value: "-9" },
                    { name: "UTC-9:30", value: "-930" },
                    { name: "UTC-8", value: "-8" },
                    { name: "UTC-7", value: "-7" },
                    { name: "UTC-6", value: "-6" },
                    { name: "UTC-5", value: "-5" },
                    { name: "UTC-4", value: "-4" },
                    { name: "UTC-3", value: "-3" },
                    { name: "UTC-3:30", value: "-330" },
                    { name: "UTC-2", value: "-2" },
                    { name: "UTC-1", value: "-1" },
                    { name: "UTC+0", value: "0" },
                    { name: "UTC+1", value: "1" },
                    { name: "UTC+2", value: "2" },
                    { name: "UTC+3", value: "3" },
                    { name: "UTC+3:30", value: "330" },
                    { name: "UTC+4", value: "4" },
                    { name: "UTC+4:30", value: "430" },
                    { name: "UTC+5", value: "5" },
                    { name: "UTC+5:30", value: "530" },
                    { name: "UTC+5:45", value: "545" },
                    { name: "UTC+6", value: "6" },
                    { name: "UTC+6:30", value: "630" },
                    { name: "UTC+7", value: "7" },
                    { name: "UTC+8", value: "8" },
                    { name: "UTC+8:45", value: "845" },
                    { name: "UTC+9", value: "9" },
                    { name: "UTC+9:30", value: "930" },
                    { name: "UTC+10", value: "10" },
                    { name: "UTC+10:30", value: "1030" },
                    { name: "UTC+11", value: "11" },
                    { name: "UTC+12", value: "12" },
                    { name: "UTC+12:45", value: "1245" },
                    { name: "UTC+13", value: "13" },
                    { name: "UTC+14", value: "14" }
                )
        )
        .setDMPermission(true),
    async execute(interaction) {
        const now = new Date();
        const currentYear = now.getUTCFullYear();
        const targetDate = new Date(Date.UTC(currentYear, 8, 11)) //8, because months are 0-indexed

        if (now.getUTCMonth() === 8 && now.getUTCDate() === 11) {
            var embedReply = embedReplyPrimaryColor(
                "9/11 Countdown",
                "Today is the day! :tada:\nHappy 9/11 everyone! :partying_face:",
            );
        }
        else {
            //if 9/11 has already passed this year
            if (now > targetDate) {
                targetDate.setUTCFullYear(currentYear + 1);
            }

            const timeDiffernce = targetDate - now;

            const days = Math.floor(timeDiffernce / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiffernce % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiffernce % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiffernce % (1000 * 60)) / 1000);

            var embedReply = embedReplyPrimaryColor(
                "911 Countdown",
                `Time left until 9/11: **${days} days ${hours} hours ${minutes} minutes ${seconds} seconds**.`,
                interaction
            );
        }

        await interaction.reply({ embeds: [embedReply] });4

        //logging
        const response = JSON.stringify(embedReply.toJSON());
		await logToFileAndDatabase(interaction, response);
    }
}