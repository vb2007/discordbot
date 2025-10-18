import { SlashCommandBuilder } from "discord.js";
import {
  embedReplySuccessColor,
  embedReplyFailureColor,
} from "../../helpers/embeds/embed-reply.js";
import { checkIfNotInGuild } from "../../helpers/command-validation/general.js";
import { replyAndLog } from "../../helpers/reply.js";
import { query } from "../../helpers/db.js";

const commandName = "withdraw";

export default {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Withdraws a specified amount of money from your bank account.")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("The amount of money you want to withdraw.")
        .setRequired(true)
    )
    .setDMPermission(false),
  async execute(interaction) {
    const guildCheck = checkIfNotInGuild(commandName, interaction);
    if (guildCheck) {
      return await replyAndLog(interaction, guildCheck);
    }

    const amount = interaction.options.getInteger("amount");
    const interactionUserId = interaction.user.id;
    const result = await query("SELECT balance, balanceInBank FROM economy WHERE userId = ?", [
      interactionUserId,
    ]);
    const balance = Number(result[0]?.balance) || 0;
    const balanceInBank = Number(result[0]?.balanceInBank) || 0;

    if (balanceInBank < amount) {
      var embedReply = embedReplyFailureColor(
        "Withdraw - Error",
        `You can't withdraw that much money from your bank account.\nYour current bank balance is only \`$${balanceInBank}\`. :bank:`,
        interaction
      );

      return await replyAndLog(interaction, embedReply);
    }

    await query(
      "UPDATE economy SET balance = balance + ?, balanceInBank = balanceInBank - ? WHERE userId = ?",
      [amount, amount, interactionUserId]
    );

    var embedReply = embedReplySuccessColor(
      "Withdraw - Success",
      `You've successfully withdrawn \`$${amount}\` from your bank account.\nYour current balance in the bank is \`$${balanceInBank - amount}\`. :bank:\nYour current balance is \`$${balance + amount}\`. :moneybag:`,
      interaction
    );

    return await replyAndLog(interaction, embedReply);
  },
};
