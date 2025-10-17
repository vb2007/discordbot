import { SlashCommandBuilder } from "discord.js";
import { embedReplyPrimaryColorWithFields } from "../../helpers/embeds/embed-reply.js";
import { getRemainingCooldown } from "../../helpers/command-validation/economy.js";
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

    const remainingTimes = [
      {
        name: "Working",
        value: await getRemainingCooldown("work", "lastWorkTime", interactionUserId),
        inline: true,
      },
      {
        name: "Begging",
        value: await getRemainingCooldown("beg", "lastBegTime", interactionUserId),
        inline: true,
      },
      {
        name: "Robbing",
        value: await getRemainingCooldown("rob", "lastRobTime", interactionUserId),
        inline: true,
      },
      {
        name: "Playing roulette",
        value: await getRemainingCooldown("roulette", "lastRouletteTime", interactionUserId),
        inline: true,
      },
      {
        name: "Playing blackjack",
        value: await getRemainingCooldown("blackjack", "lastBlackjackTime", interactionUserId),
        inline: true,
      },
      {
        name: "Flipping a coin",
        value: await getRemainingCooldown("coinflip", "lastCoinflipTime", interactionUserId),
        inline: true,
      },
    ];

    const embedReply = embedReplyPrimaryColorWithFields(
      "Economy cooldowns",
      "",
      remainingTimes,
      interaction
    );

    return replyAndLog(interaction, embedReply);
  },
};
