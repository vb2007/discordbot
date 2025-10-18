import { SlashCommandBuilder } from "discord.js";
import {
  embedReplySuccessColor,
  embedReplyWarningColor,
  embedReplyFailureColor,
} from "../../helpers/embeds/embed-reply.js";
import { checkIfNotInGuild } from "../../helpers/command-validation/general.js";
import { checkCooldown } from "../../helpers/command-validation/economy.js";
import { replyAndLog } from "../../helpers/reply.js";
import { query } from "../../helpers/db.js";

const commandName = "beg";

export default {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Lets you beg for a random (or no) amount of money.")
    .setDMPermission(false),
  async execute(interaction) {
    const guildCheck = checkIfNotInGuild(commandName, interaction);
    if (guildCheck) {
      return await replyAndLog(interaction, guildCheck);
    }

    const result = await query("SELECT userId, balance FROM economy WHERE userId = ?", [
      interaction.user.id,
    ]);
    const userId = result[0]?.userId || null;
    const balance = result[0]?.balance || null;

    const outcomeChance = Math.floor(Math.random() * 100);
    const amount = Math.floor(Math.random() * 85);

    if (userId) {
      const cooldownCheck = await checkCooldown(commandName, interaction);
      if (cooldownCheck) {
        return await replyAndLog(interaction, cooldownCheck);
      }

      if (outcomeChance < 60 || balance <= 100) {
        await query("UPDATE economy SET balance = balance + ?, lastBegTime = ? WHERE userId = ?", [
          amount,
          new Date().toISOString().slice(0, 19).replace("T", " "),
          userId,
        ]);

        var embedReply = embedReplySuccessColor(
          "Begging.",
          `You've begged and some random guy gave you \`$${amount}\` dollars.`,
          interaction
        );
      }
      //30% chance for getting nothing
      else if (outcomeChance < 90 || balance <= 100) {
        var embedReply = embedReplyWarningColor(
          "Begging.",
          `While you were begging on the street, a random guy just kicked you in the balls and left you alone with nothing.`,
          interaction
        );
      }
      //10% chance for loosing money
      else {
        await query("UPDATE economy SET balance = balance - ?, lastBegTime = ? WHERE userId = ?", [
          amount,
          new Date().toISOString().slice(0, 19).replace("T", " "),
          userId,
        ]);

        var embedReply = embedReplyFailureColor(
          "Begging.",
          `While you were begging near a trash can, a random guy (with dark skin color) took the coins from you cup, then ran away.\nYou've lost \`$${amount}\` dollars.`,
          interaction
        );
      }

      return await replyAndLog(interaction, embedReply);
    }

    //if it's the executor's first time using any economy command (so it's userId is not in the database yet...)
    await query(
      "INSERT INTO economy (userName, userId, balance, firstTransactionDate, lastBegTime) VALUES (?, ?, ?, ?, ?)",
      [
        interaction.user.username,
        interaction.user.id,
        amount,
        new Date().toISOString().slice(0, 19).replace("T", " "),
        new Date().toISOString().slice(0, 19).replace("T", " "),
      ]
    );

    var embedReply = embedSuccessColor(
      "Begging.",
      `You've begged and some random guy gave you \`$${amount}\` dollars.`,
      interaction
    );

    return await replyAndLog(interaction, embedReply);
  },
};
