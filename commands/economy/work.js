const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { logToFileAndDatabase } = require("../../logger");
const db = require("../../db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("work")
        .setDescription("Gives you a random amount of money."),
    async execute(interaction) {
        const interactionUserId = interaction.user.id;

        const query = await db.query("SELECT userId, lastWorkTime FROM economy WHERE userId = ?", [interactionUserId]);
        
        const userId = query[0]?.userId || null;
        const lastWorkTime = query[0]?.lastWorkTime || null; //lastWorkTime is stored as UTC
        // const now = new Date();
        const thirtyMinutesAgoUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000 - 30 * 60000);

        const amount = Math.floor(Math.random() * 100);
        if (userId) {
            if (!lastWorkTime || lastWorkTime <= thirtyMinutesAgoUTC) {
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
                const remainingTime = Math.ceil((lastWorkTime.getTime() - thirtyMinutesAgoUTC.getTime()) / 60000);
                var replyContent = `You've already worked in the last 30 minutes.\nPlease wait another ${remainingTime} minute(s) before trying to work again.`;
            }
        }
        else {
            //if it's a user's first time using this command (so it's userId is not in the database yet...)
            await db.query("INSERT INTO economy (userId, balance, lastWorkTime) VALUES (?, ?, ?)",
                [
                    interactionUserId,
                    amount,
                    new Date().toISOString().slice(0, 19).replace('T', ' '),
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
    }
}