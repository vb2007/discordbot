import { SlashCommandBuilder } from "discord.js";
import { embedReplySaidByPrimaryColor } from "../../helpers/embeds/embed-reply.js";
import { logToFileAndDatabase } from "../../helpers/logger.js";

export default {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Makes the bot say something.")
    .addStringOption((option) =>
      option.setName("message").setDescription("The message the bot will say.").setRequired(true)
    )
    .setDMPermission(true),
  async execute(interaction) {
    const message = interaction.options.getString("message");

    var embedReply = embedReplySaidByPrimaryColor("The bot said:", `*${message}*`, interaction);

    await interaction.reply({ embeds: [embedReply] });
    await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
  },
};
