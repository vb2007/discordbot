const { EmbedBuilder, SlashCommandBuilder, Colors } = require("discord.js");
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
        const lastWorkTime = query[0]?.lastWorkTime || null;
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

        console.log(query);
        console.log(userId);
        console.log(lastWorkTime);
        console.log(thirtyMinutesAgo);

        const amount = Math.floor(Math.random() * 1000000);
        if (userId) {
            if (lastWorkTime > thirtyMinutesAgo || !lastWorkTime) {
                await db.query("UPDATE economy SET balance = balance + ?, lastWorkTime = ? WHERE userId = ?",
                    [
                        amount,
                        new Date(Date.now()).toISOString().slice(0, 19).replace('T', ' '),
                        userId
                    ]
                );
                
                var replyContent = `You've worked and succesfully earned $**${amount}** dollars.`;
            }
            else {
                var replyContent = `You've already worked in the last 30 minutes.\nPlease wait another ${Math.ceil((lastWorkTime.getTime() - thirtyMinutesAgo.getTime()) / 60000)} minutes before trying to work again.`;
            }
        }
        else {
            //if it's a user's first time using this command (so it's userId is not in the database yet...)
            await db.query("INSERT INTO economy (userId, balance, lastWorkTime) VALUES (?, ?, ?)",
                [
                    interactionUserId,
                    amount,
                    new Date(Date.now()).toISOString().slice(0, 19).replace('T', ' '),
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