import { SlashCommandBuilder } from "discord.js";
import { embedReplyPrimaryColorWithFields } from "../../helpers/embeds/embed-reply.js";
import { checkIfNotInGuild } from "../../helpers/command-validation/general.js";
import { query } from "../../helpers/db.js";

const commandName = "store";

export default {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription(
      "Returns a store page with various purchaseable items that can help with your economy status."
    )
    .setNSFW(false)
    .setDMPermission(false),
  async execute(interaction) {
    const guildCheck = checkIfNotInGuild(commandName, interaction);
    if (guildCheck) {
      return await replyAndLog(interaction, guildCheck);
    }

    const storeQuery = query(
      `SELECT name, price, description FROM economyStore ORDER BY price ASC`
    );
    console.log(storeQuery);

    const embedReply = embedReplyPrimaryColorWithFields(
      "Store",
      "Use the `/buy`(`name`) command to purchase any of these items.",
      {},
      interaction
    );

    return await replyAndLog(interaction, embedReply);
  },
};
