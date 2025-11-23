import { SlashCommandBuilder } from "discord.js";
import { embedReplyPrimaryColorWithFields } from "../../helpers/embeds/embed-reply.js";
import { checkIfNotInGuild } from "../../helpers/command-validation/general.js";
import { query } from "../../helpers/db.js";

const commandName = "store";

export default {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("")
    .setNSFW(false)
    .setDMPermission(false),
  async execute(interaction) {
    const guildCheck = checkIfNotInGuild(commandName, interaction);
    if (guildCheck) {
      return await replyAndLog(interaction, guildCheck);
    }

    const embedReply = embedReplyPrimaryColorWithFields("Store", "", {}, interaction);

    return await replyAndLog(interaction, embedReply);
  },
};
