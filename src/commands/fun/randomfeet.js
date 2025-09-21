const { SlashCommandBuilder } = require("discord.js");
const {
  embedReplyPrimaryColorImg,
  embedReplyImg,
} = require("../../helpers/embeds/embed-reply");
const { loadLinks } = require("../../helpers/scraping");
const { logToFileAndDatabase } = require("../../helpers/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("randomfeet")
    .setDescription("Sends a random feetpic.")
    .setNSFW(true),
  async execute(interaction) {
    //waits (and edits it's reply later) if the host is too slow
    await interaction.deferReply();

    const links = await loadLinks(
      "pics.json",
      "https://cdn.vb2007.hu/autoindex/feetpics/",
    );

    //picks a random image from the array
    const randomFeet = links[Math.floor(Math.random() * links.length)];

    /* if (randomFeet == "https://vb2007.hu/cdn/feetpics/145.jpg") {
      var embedReply = embedReplyImg(
        0xebb22f,
        "CONGRATULATIONS!",
        "You found the hidden feetpic! :tada:",
        randomFeet,
        interaction,
      );
      } else { */
    var embedReply = embedReplyPrimaryColorImg(
      "Randomfeet.",
      "Here is a random feetpic:",
      randomFeet,
      interaction,
    );
    //}

    await interaction.editReply({ embeds: [embedReply] });
    await logToFileAndDatabase(
      interaction,
      JSON.stringify(embedReply.toJSON()),
    );
  },
};
