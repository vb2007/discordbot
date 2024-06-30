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
                .setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        if (!interaction.inGuild()) {
            var replyContent = "You can only rob from a member in a server.";
        }
        else {
            const query = await db.query("SELECT lastRobTime FROM economy WHERE userId = ?", [interaction.user.id]);
            const lastRobTime = query[0]?.lastRobTime || null;

            const thirtyMinutesAgoUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000 - 30 * 60000);

            if (!lastRobTime || lastRobTime <= thirtyMinutesAgoUTC) {
                console.log(lastRobTime);
                console.log(thirtyMinutesAgoUTC);
                const targetUserId = interaction.options.getUser("target").id;

                const query = await db.query("SELECT balance FROM economy WHERE userId = ?", [targetUserId]);
                const targetUserBalance = query[0]?.balance || null;

                if (targetUserBalance > 50) {
                    const targetUserName = interaction.options.getUser("target").tag;
                    const robAmount = Math.floor(Math.random() * 50);

                    //removes the robbed amount from the target user
                    await db.query("UPDATE economy SET balance = balance - ? WHERE userId = ?",
                        [
                            robAmount,
                            targetUserId
                        ]
                    );

                    //adds the robbed amount to the interaction's executor
                    await db.query("UPDATE economy SET balance = balance + ?, lastRobTime = ? WHERE userId = ?",
                        [
                            robAmount,
                            new Date().toISOString().slice(0, 19).replace('T', ' '),
                            interaction.user.id
                        ]
                    );

                    var replyContent = `Successfully robbed $**${robAmount}** from **${targetUserName}**.`;
                }
                else {
                    var replyContent = `The user you're trying to rob from must have a minimum of **$50**.\nPlease choose another target.\n**TIP:** You can check how much money other memebers have with the \`/leaderboard\` command.`;
                }
            }
            else {
                var replyContent = `You've already robbed in the last 30 minutes.\nPlease wait another ${Math.ceil((lastRobTime.getTime() - thirtyMinutesAgoUTC.getTime()) / 60000)} minutes before trying to rob again.`;
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