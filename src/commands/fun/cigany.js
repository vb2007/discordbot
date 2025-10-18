import { SlashCommandBuilder } from "discord.js";
import {
  embedReplyPrimaryColorImg,
  embedReplyFailureColor,
} from "../../helpers/embeds/embed-reply.js";
import { loadLinks } from "../../helpers/scraping.js";
import { replyAndLog } from "../../helpers/reply.js";
import { logToFileAndDatabase } from "../../helpers/logger.js";

const commandName = "cigany";

export default {
  data: new SlashCommandBuilder().setName(commandName).setDescription("fuj").setDMPermission(true),
  async execute(interaction) {
    await interaction.deferReply();

    let title;
    let description;

    const links = await loadLinks("cigpics.json", "https://cdn.vb2007.hu/autoindex/kardoscigok/");
    const randomCig = links[Math.floor(Math.random() * links.length)];

    try {
      title = "Cigány";
      description = "Fuj";

      var embedReply = embedReplyPrimaryColorImg(title, description, randomCig, interaction);

      await interaction.editReply({ embeds: [embedReply] });
      return await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
    } catch (error) {
      title = "Error";
      description = "Meg cigányozni se tud a bot. :(";

      return await replyAndLog(
        interaction,
        embedReplyFailureColor(title, description, interaction)
      );
    }
  },
};
