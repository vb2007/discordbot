const { EmbedBuilder } = require("discord.js");
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

            if (lastTimeRobbed <= Date.now()) { //át kell írni fél órára vagy valamire

            }

            var replyContent = "";
        }

        var embedReply = new EmbedBuilder({
            color: "#5F0FD6",
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