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
    const randomVideo = await query(
      `SELECT directVideoUrl, forumPostUrl, videoTitle, processedAt
      FROM darwinCache
      WHERE forumPostUrl IS NOT NULL
        AND videoTitle IS NOT NULL
      ORDER BY RAND()
      LIMIT 1`
    );

    console.log(randomVideo);

    const directVideoUrl = randomVideo[0].directVideoUrl;
    const forumPostUrl = randomVideo[0].forumPostUrl;
    const videoTitle = randomVideo[0].videoTitle;
    const processedAt = Math.floor(new Date(randomVideo[0].processedAt).getTime() / 1000);

    const messageContent =
      `[[ STREAMING & DOWNLOAD ]](${directVideoUrl})  -  [[ FORUM POST ]](<${forumPostUrl}>)\n` +
      `**Title**: ${videoTitle}\n` +
      `**Processed at**: <t:${processedAt}:F>`;

    await baseReplyAndLog(interaction, messageContent);
  },
};
