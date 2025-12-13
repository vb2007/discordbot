import { SlashCommandBuilder } from "discord.js";
import {
  embedReplySuccessColor,
  embedReplyFailureColor,
  embedReply,
  embedReplyWarningColor,
} from "../../helpers/embeds/embed-reply.js";
import { checkIfNotInGuild } from "../../helpers/command-validation/general.js";
import { replyAndLog } from "../../helpers/reply.js";
import { query } from "../../helpers/db.js";

const commandName = "buy";

export default {
  data: new SlashCommandBuilder()
    .setName("buy")
    .setDescription("Let's you buy a specified item.")
    .addStringOption((option) =>
      option
        .setName("item-name")
        .setDescription("The item's exact name you would like to buy.")
        .setMinLength(2)
        .setMaxLength(10)
        .setRequired(true)
    )
    .setNSFW(false)
    .setDMPermission(false),
  async execute(interaction) {
    const guildCheck = checkIfNotInGuild(commandName, interaction);
    if (guildCheck) {
      return await replyAndLog(interaction, guildCheck);
    }

    const itemName = interaction.options.getString("item-name");

    const allItemsQuery = await query("SELECT price, name FROM economyStore");
    const validItem = allItemsQuery.find((item) => item.name === itemName);

    if (!validItem) {
      const embedReply = embedReplyWarningColor(
        "Buy: Invalid Item",
        `\`${itemName}\` isn't a valid item.\nUse the \`/store\` command to see all purchaseable items.`,
        interaction
      );

      return await replyAndLog(interaction, embedReply);
    }
  },
};
