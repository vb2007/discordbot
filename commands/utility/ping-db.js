const { SlashCommandBuilder } = require("discord.js");
const { embedReplyPrimaryColorWithFields, embedReplyFailureColor } = require("../../helpers/embed-reply");
const db = require("../../helpers/db");
const { logToFileAndDatabase } = require("../../helpers/logger");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping-db")
        .setDescription("Displays the the bot's MariaDB database's current latency."),
    async execute(interaction) {
        try {
            const startTime = Date.now();
            await db.query("SELECT 1");
            const endTime = Date.now();

            const latency = endTime - startTime;

            var embedReply = embedReplyPrimaryColorWithFields(
                "Ping the database",
                "",
                [
                    { name: "Pong from the database! :ping_pong:", value: "" },
                    { name: "Response time: ", value: `**${latency}ms** or **${latency / 1000}s**` },
                ],
                interaction
            );
        }
        catch (error) {
            console.error(error);

            var embedReply = embedReplyFailureColor(
                "Ping the database - Error",
                "**Error:** Database connection failed.\nIf this issue persists, please [report it on GitHub](https://github.com/vb2007/discordbot/issues/new).",
                interaction
            );
        }

        await interaction.reply({ embeds: [embedReply] });

        //logging
        const response = JSON.stringify(embedReply.toJSON());
        await logToFileAndDatabase(interaction, response);
    }
}