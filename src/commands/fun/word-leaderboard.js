import { SlashCommandBuilder } from "discord.js";
import { embedReplyPrimaryColor } from "../../helpers/embeds/embed-reply.js";
import { query } from "../../helpers/db.js";

export default {
  data: new SlashCommandBuilder()
    .setName("word-leaderboard")
    .setDescription(
      "Counts a specified word in the current server and sends back a leaderboard with the users who used that word the most."
    )
    .addStringOption((option) =>
      option
        .setName("word")
        .setDescription("The word that will get counted.")
        .setRequired(true)
        .setMinLength(2)
        .setMaxLength(12)
    )
    .setDMPermission(false),
  async execute(interaction) {
    const guildCheck = checkIfNotInGuild(commandName, interaction);
    if (guildCheck) {
      return await replyAndLog(interaction, guildCheck);
    }

    const targetWord = interaction.options.getString("word");
  },
};
