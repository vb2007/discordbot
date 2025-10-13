import { SlashCommandBuilder } from "discord.js";
import { embedReplyPrimaryColor } from "../../helpers/embeds/embed-reply.js";
import { logToFileAndDatabase } from "../../helpers/logger.js";

export default {
  data: new SlashCommandBuilder()
    .setName("coinflip-fun")
    .setDescription("Flips a coin that has a 50/50 chance landing on head or tails."), //to the wiki: Has an economy (/coinflip) version w/gambling.
  async execute(interaction) {
    const random = Math.floor(Math.random() * 2) == 0;

    if (random) {
      var result = "head";
    } else {
      var result = "tails";
    }

    var embedReply = embedReplyPrimaryColor(
      "Coinflip.",
      `You've flipped **${result}**.`,
      interaction
    );

    await interaction.reply({ embeds: [embedReply] });
    await logToFileAndDatabase(interaction, JSON.stringify(embedReply.toJSON()));
  },
};
