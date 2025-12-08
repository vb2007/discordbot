import { SlashCommandBuilder } from "discord.js";
import {
  embedReplySuccessColor,
  embedReplyFailureColor,
} from "../../helpers/embeds/embed-reply.js";
import { checkIfNotInGuild } from "../../helpers/command-validation/general.js";
import { replyAndLog } from "../../helpers/reply.js";
import { query } from "../../helpers/db.js";

const commandName = "buy";

export default {
  data: new SlashCommandBuilder()
    .setName("buy")
    .setDescription("Let's you buy a specified item.")
    .setNSFW(false)
    .setDMPermission(false),
  async execute(interaction) {
    const guildCheck = checkIfNotInGuild(commandName, interaction);
    if (guildCheck) {
      return await replyAndLog(interaction, guildCheck);
    }
  },
};
