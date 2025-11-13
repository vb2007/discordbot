import { SlashCommandBuilder } from "discord.js";
import { query } from "../../helpers/db.js";
import { embedReplyPrimaryColorWithFields } from "../../helpers/embeds/embed-reply.js";
import { baseReplyAndLog } from "../../helpers/reply.js";

import config from "../../../config.json" with { type: "json" };
const darwinConfig = config.darwin;

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

    const videoId = randomVideo[0].videoId;
    const directStreamLink = `${darwinConfig.cdnUrl}/${videoId}.mp4`;

    const messageContent = `[[ STREAMING & DOWNLOAD ]](${directStreamLink})  -  [[ FORUM POST ]](<${comments}>)\nTitle: {}\nProcessed at: {}\nSize: {}`;

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

    await baseReplyAndLog(messageContent, embedReply, "a");
  },
};
