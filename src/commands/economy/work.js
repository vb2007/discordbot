import { SlashCommandBuilder } from "discord.js";
import {
  embedReplySuccessColor,
  embedReplyFailureColor,
} from "../../helpers/embeds/embed-reply.js";
import { checkIfNotInGuild } from "../../helpers/command-validation/general.js";
import { checkCooldown } from "../../helpers/command-validation/economy.js";
import { replyAndLog } from "../../helpers/reply.js";
import { query } from "../../helpers/db.js";

const commandName = "work";

export default {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Lets you work for a random amount of money.")
    .setDMPermission(false),
  async execute(interaction) {
    const guildCheck = checkIfNotInGuild(commandName, interaction);
    if (guildCheck) {
      return await replyAndLog(interaction, guildCheck);
    }

    const cooldownCheck = await checkCooldown(commandName, interaction);
    if (cooldownCheck) {
      return await replyAndLog(interaction, cooldownCheck);
    }

    const result = await query("SELECT userId FROM economy WHERE userId = ?", [
      interaction.user.id,
    ]);
    const userId = result[0]?.userId || null;

    const amount = Math.floor(Math.random() * 100);
    if (userId) {
      await query("UPDATE economy SET balance = balance + ?, lastWorkTime = ? WHERE userId = ?", [
        amount,
        new Date().toISOString().slice(0, 19).replace("T", " "),
        userId,
      ]);

      var embedReply = embedReplySuccessColor(
        "Working",
        `You've worked and succesfully earned \`$${amount}\` dollars.`,
        interaction
      );

      return await replyAndLog(interaction, embedReply);
    }

    //if it's the executor's first time using any economy command (so it's userId is not in the database yet...)
    await query(
      "INSERT INTO economy (userName, userId, balance, firstTransactionDate, lastWorkTime) VALUES (?, ?, ?, ?, ?)",
      [
        interaction.user.username,
        interaction.user.id,
        amount,
        new Date().toISOString().slice(0, 19).replace("T", " "),
        new Date().toISOString().slice(0, 19).replace("T", " "),
      ]
    );

    var embedReply = embedReplySuccessColor(
      "Working",
      `You've worked and succesfully earned \`$${amount}\` dollars.`,
      interaction
    );

    return await replyAndLog(interaction, embedReply);
  },
};
