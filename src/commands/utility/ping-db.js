import { SlashCommandBuilder } from "discord.js";
import {
  embedReplyPrimaryColorWithFields,
  embedReplyFailureColor,
} from "../../helpers/embeds/embed-reply.js";
import { query } from "../../helpers/db.js";
import { logToFileAndDatabase } from "../../helpers/logger.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping-db")
    .setDescription("Displays the the bot's MariaDB database's current latency."),
  async execute(interaction) {
    try {
      const startTime = Date.now();
      await query("SELECT 1");
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
    } catch (error) {
      console.error(error);

      var embedReply = embedReplyFailureColor(
        "Ping the database - Error",
        "**Error:** Database connection failed.\nIf this issue persists, please [report it on GitHub](https://github.com/vb2007/discordbot/issues/new).",
        interaction
      );
    }

    await interaction.reply({ embeds: [embedReply] });
    await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
  },
};
