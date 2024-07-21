const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const db = require("../../db");
const { logToFileAndDatabase } = require("../../logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping-db")
        .setDescription("Displays the the bot's MariaDB database's current latency."),
    async execute(interaction) {
        // let conn;
        try {
            // let conn;
            // conn = await db.pool.getConnection();

            const startTime = Date.now();
            await db.query("SELECT 1");
            const endTime = Date.now();

            const latency = endTime - startTime;

            var embedRespone = `**${latency}ms** or **${latency / 1000}s**`;
        }
        catch (error) {
            console.error(error);
            var embedRespone = "**Error:** Database connection failed.\nIf this issue persists, please [report it on GitHub](https://github.com/vb2007/discordbot/issues/new).";
        }

        const embedReply = new EmbedBuilder({
            color: 0x5F0FD6,
            title: "Ping the database.",
            fields: [
                { name: "Pong from the database! :ping_pong:", value: "" },
                { name: "Response time: ", value: embedRespone, inline: true },
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: `Requested by: ${interaction.user.username}`,
                icon_url: interaction.user.displayAvatarURL({ dynamic: true })
            }
        });

        await interaction.reply({ embeds: [embedReply] });

        //logging
        const response = JSON.stringify(embedReply.toJSON());
        await logToFileAndDatabase(interaction, response);
    }
}