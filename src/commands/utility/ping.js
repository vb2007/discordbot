import { SlashCommandBuilder } from "discord.js";
import { embedReplyPrimaryColorWithFields } from "../../helpers/embeds/embed-reply.js";
import { logToFileAndDatabase } from "../../helpers/logger.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Displays the discord API's current latency."),
  async execute(interaction) {
    const embedReply = embedReplyPrimaryColorWithFields(
      "Ping.",
      "",
      [
        { name: "Pong! :ping_pong:", value: "" },
        {
          name: "Response time: ",
          value: `${Date.now() - interaction.createdTimestamp}ms`,
          inline: true,
        },
      ],
      interaction
    );

    await interaction.reply({ embeds: [embedReply] });
    await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
  },
};
