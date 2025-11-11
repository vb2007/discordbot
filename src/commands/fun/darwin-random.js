import { SlashCommandBuilder } from "discord.js";
import { query } from "../../helpers/db.js";
import { embedReplyPrimaryColorWithFields } from "../../helpers/embeds/embed-reply.js";
import { replyAndLogWithEmbedAndDescription } from "../../helpers/reply.js";

export default {
  data: new SlashCommandBuilder()
    .setName("darwin-random")
    .setDescription("Sends back a random streamable video from Darwin's database.")
    .setNSFW(false)
    .setDMPermission(true),
  async execute(interaction) {
    const randomVideo = query(
      "SELECT videoId, processedAt FROM darwinCache ORDER BY RAND() LIMIT 1;"
    );

    const embedReply = embedReplyPrimaryColorWithFields(
      "Random video from Darwin's database",
      "",
      [
        { name: "Title", value: "", inline: false },
        { name: "Processed at", value: "", inline: true },
        { name: "Size", value: "", inline: true },
      ],
      interaction
    );

    await replyAndLogWithEmbedAndDescription(interaction, embedReply, "a");
  },
};
