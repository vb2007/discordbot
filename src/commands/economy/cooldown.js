import { SlashCommandBuilder } from "discord.js";
import { embedReplyPrimaryColorWithFields } from "../../helpers/embeds/embed-reply.js";
import { replyAndLog } from "../../helpers/reply.js";
import { query } from "../../helpers/db.js";

const commandName = "cooldown";

export default {
  data: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Display the remaining cooldowns for all economy commands.")
    .setDMPermission(false),
  async execute(interaction) {
    const guildCheck = checkIfNotInGuild(commandName, interaction);
    if (guildCheck) {
      return await replyAndLog(interaction, guildCheck);
    }

    const interactionUserId = interaction.user.id;

    const result = await query(
      "SELECT lastWorkTime, lastBegTime, lastRobTime, lastRouletteTime, lastBlackjackTime, lastCoinflipTime  FROM economy WHERE userId = ?",
      [interactionUserId]
    );

    const lastWorkTime = query[0]?.lastWorkTime;
    const lastBegTime = query[0]?.lastBegTime;
    const lastRobTime = query[0]?.lastRobTime;
    const lastRouletteTime = query[0]?.lastRouletteTime;
    const lastBlackjackTime = query[0]?.lastBlackjackTime;
    const lastCoinflipTime = query[0]?.lastCoinflipTime;

    const remainingTimeInSeconds = Math.ceil(
      (lastWorkTime.getTime() - nextApprovedUsageTime.getTime()) / 1000
    );
    const remainingMinutes = Math.floor(remainingTimeInSeconds / 60);
    const remainingSeconds = remainingTimeInSeconds % 60;

    const nextApprovedUsageTime = new Date(
      new Date().getTime() + new Date().getTimezoneOffset() * 60000 - configuredCooldown * 60000
    );

    const remainingTimes = [
      { name: "Working", value: lastWorkTime ? "You haven't worked yet" : "", inline: true },
      { name: "Begging", value: "", inline: true },
      { name: "Robbing", value: "", inline: true },
      { name: "Playing roulette", value: "", inline: true },
      { name: "Playing blackjack", value: "", inline: true },
      { name: "Flipping a coin", value: "", inline: true },
    ];

    const embedReply = embedReplyPrimaryColorWithFields(
      "Economy cooldowns",
      remainingTimes,
      interaction
    );

    return replyAndLog(interaction, embedReply);
  },
};
