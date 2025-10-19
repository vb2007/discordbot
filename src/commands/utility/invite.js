import { SlashCommandBuilder } from "discord.js";
import { embedReplyPrimaryColor } from "../../helpers/embeds/embed-reply.js";
import { replyAndLog } from "../../helpers/reply.js";

import "dotenv/config";
const clientId = process.env.CLIENT_ID;

const commandName = "invite";

export default {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Gives you an URL to invite the bot to any server.")
    .setDMPermission(true),
  async execute(interaction) {
    const inviteURL = `https://discord.com/oauth2/authorize?client_id=${clientId}&scope=bot&permissions=8`;

    const embedReply = embedReplyPrimaryColor(
      "Invite",
      `You can invite the bot to any server using [THIS URL](${inviteURL}).`,
      interaction
    );

    return replyAndLog(interaction, embedReply);
  },
};
