const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const { logToFileAndDatabase } = require("../../logger");
const db = require("../../db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rob")
        .setDescription("Tries to rob a random amount of money from a specified user.")
        .addUserOption(option =>
            option
                .setName("target")
                .setDescription("Choose the target you want to rob from.")
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            var replyContent = "You can only rob from a member in a server.";
        }
        else {
            interactonUserId = interaction.user.id;
            const query = await db.query("SELECT lastRobTime FROM economy WHERE userId = ?", [interactionUserId]);
            const lastTimeRobbed = query[0]?.lastTimeRobbed || null;

            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

            if (lastTimeRobbed > thirtyMinutesAgo || !lastTimeRobbed) {
                const targetUserName = interaction.options.getUser("target").tag;
                const targetUserId = interaction.options.getUser("target").id;
                const robAmount = Math.floor(Math.random() * 10000);

                //adds the robbet amount to the interaction's user
                db.query("UPDATE economy SET money = money + ?, lastRobTime = ? WHERE userId = ?", [robAmount, Date.now(), targetUserId]);
                //removes the robbet amount from the target user
                db.query("UPDATE economy SET money = money - ? WHERE userId = ?", [robAmount, targetUserId]);
                var replyContent = `Successfully robbed **${robAmount}** from **${targetUserName}**.`;
            }
            else {
                var replyContent = `You've already robbed in the last 30 minutes.\nPlease wait another ${Math.ceil((lastTimeRobbed.getTime() - thirtyMinutesAgo.getTime()) / 60000)} minutes before trying to rob again.`;
            }
        }

        var embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: "Robbing a member.",
            description: replyContent,
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}` ,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true }),
            },
        });

        await interaction.reply({ embeds: [embedReply] });
    }
}