const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { logToFileAndDatabase } = require("../../logger");
const db = require("../../db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("work")
        .setDescription("Gives you a random amount of money."),
    async execute(interaction) {
        const interactionUserId = interaction.user.id;
        const query = db.query("SELECT userId, lastWorkTime FROM economy WHERE userId = ?", [interactionUserId]);
        const lastTimeWorked = query[0]?.lastTimeWorked || null;
        const userId = query[0]?.userId || null;
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        
        if (lastTimeWorked > thirtyMinutesAgo || !lastTimeRobbed) {
            const amount = Math.floor(Math.random() * 1000000);

            if (userId) {
                //if it's a user's first time using this command (so it's userId is not already in the database...)
                await db.query("UPDATE economy SET money = money + ? WHERE userId = ?", [amount, userId]);
            }
            else {
                await db.query("INSERT INTO economy (userId, money) VALUES (?,?)", [interactionUserId, amount]);
            }

            var replyContent = `You've worked and succesfully earned $**${amount}**. dollars.`;
        }
        else {
            var replyContent = `You've already worked in the last 30 minutes.\nPlease wait another ${Math.ceil((lastTimeWorked.getTime() - thirtyMinutesAgo.getTime()) / 60000)} minutes before trying to work again.`;
        }
        
        var embedReply = new EmbedBuilder({
            color: "#5F0FD6",
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