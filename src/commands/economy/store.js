import { SlashCommandBuilder } from "discord.js";
import { embedReplyPrimaryColorWithFields } from "../../helpers/embeds/embed-reply.js";
import { checkIfNotInGuild } from "../../helpers/command-validation/general.js";
import { replyAndLog } from "../../helpers/reply.js";
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

    const storeQuery = await query(
      `SELECT name, price, description FROM economyStore ORDER BY price ASC`
    );
    const fields = storeQuery.map((item) => ({
      name: `${item.name} - \`$${item.price}\``,
      value: item.description,
      inline: false,
    }));

    const embedReply = embedReplyPrimaryColorWithFields(
      "Store",
      "Use the `/buy`(**item name**) command to purchase any of these items.",
      fields,
      interaction
    );

    return await replyAndLog(interaction, embedReply);
  },
};
