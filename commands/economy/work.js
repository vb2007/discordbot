const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { logToFileAndDatabase } = require("../../logger");
const db = require("../../db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("work")
        .setDescription("Gives you a random amount of money.")
        .setDMPermission(false),
    async execute(interaction) {
        const query = await db.query("SELECT userId, lastWorkTime FROM economy WHERE userId = ?", [interaction.user.id]);
        const userId = query[0]?.userId || null;
        const lastWorkTime = query[0]?.lastWorkTime || null;
        const nextApprovedWorkTimeUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000 - 5 * 60000);

        const amount = Math.floor(Math.random() * 100);
        if (userId) {
            if (!lastWorkTime || lastWorkTime <= nextApprovedWorkTimeUTC) {
                await db.query("UPDATE economy SET balance = balance + ?, lastWorkTime = ? WHERE userId = ?",
                    [
                        amount,
                        new Date().toISOString().slice(0, 19).replace('T', ' '),
                        userId
                    ]
                );
                
                var replyContent = `You've worked and succesfully earned $**${amount}** dollars.`;
            }
            else {
                const remainingTimeInSeconds = Math.ceil((lastWorkTime.getTime() - nextApprovedWorkTimeUTC.getTime()) / 1000);
                const remainingMinutes = Math.floor(remainingTimeInSeconds / 60);
                const remainingSeconds = remainingTimeInSeconds % 60;
                var replyContent = `You've already worked in the last 5 minutes.\nPlease wait **${remainingMinutes} minute(s)** and **${remainingSeconds} second(s)** before trying to **work** again.`;
            }
        }
        else {
            //if it's the executor's first time using any economy command (so it's userId is not in the database yet...)
            await db.query("INSERT INTO economy (userName, userId, balance, firstTransactionDate, lastWorkTime) VALUES (?, ?, ?, ?, ?)",
                [
                    interaction.user.username,
                    interaction.user.id,
                    amount,
                    new Date().toISOString().slice(0, 19).replace('T', ' '),
                    new Date().toISOString().slice(0, 19).replace('T', ' ')
                ]
            );
            var replyContent = `You've worked and succesfully earned $**${amount}** dollars.`;
        }
        
        var embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: "Working.",
            description: replyContent,
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}` ,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
            }
        });

        await interaction.reply({ embeds: [embedReply] });

        //logging
        const response = JSON.stringify(embedReply.toJSON());
		await logToFileAndDatabase(interaction, response);
    }
}